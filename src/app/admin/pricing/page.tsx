import { getRates } from "@/lib/store";
import { inspectionFee } from "@/lib/pricing";
import { usd } from "@/lib/format";
import { saveRatesAction } from "../actions";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, r] = await Promise.all([searchParams, getRates()]);
  const box = "mt-1 w-full rounded border border-line bg-white px-3 py-2";
  const samples = [
    ["Sale $300,000", { price: 300000, mode: "buy" as const }],
    ["Sale $2,000,000", { price: 2000000, mode: "buy" as const }],
    ["Sale $8,000,000", { price: 8000000, mode: "buy" as const }],
    ["Rent $3,000 a month", { price: 3000, mode: "rent" as const }],
  ] as const;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form action={saveRatesAction} className="space-y-4">
        <h1 className="font-display text-3xl">Inspection pricing</h1>
        {saved && <p role="status" className="rounded bg-mist p-3 text-sm text-moss">Pricing saved. New bookings use these rates.</p>}
        <fieldset className="grid grid-cols-3 gap-3">
          <legend className="mb-1 text-sm font-medium">Sale and investment</legend>
          <label className="text-sm">Percent of price<input name="salePct" type="number" step="0.001" defaultValue={r.salePct} className={box} /></label>
          <label className="text-sm">Minimum (USD)<input name="saleMin" type="number" defaultValue={r.saleMin} className={box} /></label>
          <label className="text-sm">Maximum (USD)<input name="saleMax" type="number" defaultValue={r.saleMax} className={box} /></label>
        </fieldset>
        <fieldset className="grid grid-cols-3 gap-3">
          <legend className="mb-1 text-sm font-medium">Rentals (percent of one month&rsquo;s rent)</legend>
          <label className="text-sm">Percent<input name="rentPct" type="number" step="0.1" defaultValue={r.rentPct} className={box} /></label>
          <label className="text-sm">Minimum (USD)<input name="rentMin" type="number" defaultValue={r.rentMin} className={box} /></label>
          <label className="text-sm">Maximum (USD)<input name="rentMax" type="number" defaultValue={r.rentMax} className={box} /></label>
        </fieldset>
        <label className="block text-sm">48-hour priority add-on (USD)
          <input name="priority" type="number" defaultValue={r.priority} className={box} />
        </label>
        <button className="rounded bg-ink px-5 py-3 font-medium text-chalk">Save pricing</button>
        <p className="text-sm text-ink/70">
          To set a fixed fee for one property, open it under Listings and fill in &ldquo;Fixed inspection fee&rdquo;.
        </p>
      </form>
      <div>
        <h2 className="font-display text-2xl">What customers pay now</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {samples.map(([label, l]) => (
            <li key={label} className="flex justify-between py-3"><span>{label}</span><b>{usd(inspectionFee(l, r))}</b></li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-ink/70">Priority report adds {usd(r.priority)}.</p>
      </div>
    </div>
  );
}
