import Link from "next/link";
import { stripe } from "@/lib/stripe";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let paid = false;
  let email = "";
  if (session_id) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      paid = s.payment_status === "paid";
      email = s.customer_details?.email ?? s.customer_email ?? "";
    } catch {
      /* fall through to the not-confirmed message */
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      {paid ? (
        <>
          <h1 className="font-display text-4xl">Inspection booked</h1>
          <p className="mt-3 text-ink/75">
            Payment received{email ? `. A receipt is on its way to ${email}` : ""}. Your inspector
            will confirm the visit time by email.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl">We could not confirm your payment</h1>
          <p className="mt-3 text-ink/75">
            If you were charged, the booking will appear once Stripe confirms it. Otherwise, go back
            and try again.
          </p>
        </>
      )}
      <Link href="/properties" className="mt-8 inline-block rounded bg-ink px-5 py-3 text-chalk">
        Browse more properties
      </Link>
    </main>
  );
}
