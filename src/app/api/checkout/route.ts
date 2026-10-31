import { NextResponse } from "next/server";
import { z } from "zod";
import { COUNTRIES } from "@/lib/data";
import { getListing, getRates } from "@/lib/store";
import { totalFee } from "@/lib/pricing";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const Body = z.object({
  listingId: z.string().max(40),
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.boolean(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  const b = parsed.data;
  const [listing, rates] = await Promise.all([getListing(b.listingId), getRates()]);
  if (!listing) return NextResponse.json({ error: "Property not found." }, { status: 404 });

  // Price is always computed here. The client never sends an amount.
  const amount = totalFee(listing, b.priority, rates);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  try {
    const db = supabaseAdmin();
    let bookingId = "";
    if (db) {
      const { data, error } = await db
        .from("bookings")
        .insert({
          listing_id: listing.id,
          name: b.name,
          email: b.email,
          preferred_date: b.date,
          priority: b.priority,
          amount_usd: amount,
        })
        .select("id")
        .single();
      if (error) throw error;
      bookingId = data.id;
    }

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: b.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: {
              name: `Property inspection: ${listing.title}`,
              description: `${listing.city}, ${COUNTRIES[listing.cc].name}${b.priority ? ", 48h priority report" : ""}`,
            },
          },
        },
      ],
      metadata: { bookingId, listingId: listing.id },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/properties/${listing.id}`,
    });

    if (db && bookingId) {
      await db.from("bookings").update({ stripe_session_id: session.id }).eq("id", bookingId);
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json({ error: "Payment could not be started. Try again shortly." }, { status: 500 });
  }
}
