import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const db = supabaseAdmin();
  if (db) {
    // Updates only touch rows still 'pending', so repeated deliveries are harmless.
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === "paid" && s.metadata?.bookingId) {
        await db.from("bookings").update({ status: "paid" })
          .eq("id", s.metadata.bookingId).eq("status", "pending");
      }
    } else if (event.type === "checkout.session.expired") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.metadata?.bookingId) {
        await db.from("bookings").update({ status: "expired" })
          .eq("id", s.metadata.bookingId).eq("status", "pending");
      }
    }
  }
  return new Response("ok");
}
