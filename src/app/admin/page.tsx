import { getListings, getCategories } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";
import { usd } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [listings, cats] = await Promise.all([getListings(true), getCategories(true)]);
  const db = supabaseAdmin();
  const { data } = db
    ? await db.from("bookings").select("*").order("created_at", { ascending: false }).limit(25)
    : { data: [] };
  const bookings = data ?? [];
  const paid = bookings.filter((b) => b.status === "paid");
  const stat = "rounded-lg border border-line bg-white p-4";

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={stat}><p className="text-sm text-ink/70">Listings</p><p className="font-display text-3xl">{listings.length}</p></div>
        <div className={stat}><p className="text-sm text-ink/70">Categories</p><p className="font-display text-3xl">{cats.length}</p></div>
        <div className={stat}><p className="text-sm text-ink/70">Paid inspections</p><p className="font-display text-3xl">{paid.length}</p></div>
        <div className={stat}><p className="text-sm text-ink/70">Inspection revenue</p><p className="font-display text-3xl">{usd(paid.reduce((s, b) => s + b.amount_usd, 0))}</p></div>
      </div>
      <h2 className="mt-8 font-display text-2xl">Recent bookings</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-ink/70">
            <tr><th className="py-2">Date</th><th>Name</th><th>Email</th><th>Property</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan={6} className="py-4 text-ink/70">No bookings yet.</td></tr>}
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line">
                <td className="py-2">{b.preferred_date}</td><td>{b.name}</td><td>{b.email}</td>
                <td>{b.listing_id}</td><td>{usd(b.amount_usd)}</td><td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
