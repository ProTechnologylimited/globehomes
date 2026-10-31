import { notFound } from "next/navigation";
import InspectionForm from "@/components/InspectionForm";
import ListingImage from "@/components/ListingImage";
import { COUNTRIES, MODE_LABEL } from "@/lib/data";
import { inspectionFee } from "@/lib/pricing";
import { getListing, getRates } from "@/lib/store";
import { usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [l, rates] = await Promise.all([getListing(id), getRates()]);
  if (!l) notFound();
  const fee = inspectionFee(l, rates);
  const rows: [string, string][] = [
    [MODE_LABEL[l.mode], `${usd(l.price)}${l.mode === "rent" ? " /month" : ""}`],
    ["Bedrooms", String(l.beds)],
    ["Bathrooms", String(l.baths)],
    ["Size", `${l.sqm} m²`],
    ...(l.yield ? ([["Est. gross yield", `${l.yield}%`]] as [string, string][]) : []),
  ];

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[3fr_2fr]">
      <section>
        <div className="h-64 overflow-hidden rounded-lg border border-line bg-mist sm:h-96">
          <ListingImage l={l} />
        </div>
        <p className="mt-5 text-sm text-ink/70">{COUNTRIES[l.cc].flag} {l.city}, {COUNTRIES[l.cc].name}</p>
        <h1 className="mt-1 font-display text-4xl">{l.title}</h1>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-ink/70">{k}</dt><dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-8 font-display text-xl">What the inspection covers</h2>
        <p className="mt-2 max-w-xl text-ink/75">
          Structure, roof, damp, electrics, plumbing and a legal document check, with a written report
          delivered within 72 hours of the visit.
        </p>
      </section>
      <aside className="h-fit rounded-lg border border-line bg-white p-5">
        <h2 className="font-display text-2xl">Book an inspection</h2>
        <p className="mb-5 mt-1 text-sm text-ink/70">Fee for this property: {usd(fee)}</p>
        <InspectionForm listingId={l.id} baseFee={fee} priorityFee={rates.priority} />
      </aside>
    </main>
  );
}
