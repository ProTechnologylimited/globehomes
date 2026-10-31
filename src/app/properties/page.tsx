import PropertyCard from "@/components/PropertyCard";
import { COUNTRIES, filterListings, type CountryCode } from "@/lib/data";
import { inspectionFee } from "@/lib/pricing";
import { getCategories, getListings, getRates } from "@/lib/store";

export const dynamic = "force-dynamic";

type SP = Promise<{ cc?: string; mode?: string; cat?: string; q?: string; sort?: string }>;

export default async function Properties({ searchParams }: { searchParams: SP }) {
  const f = await searchParams;
  const [all, cats, rates] = await Promise.all([getListings(), getCategories(), getRates()]);
  const results = filterListings(all, f);
  const box = "rounded border border-line bg-white px-3 py-2";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl">Properties</h1>
      <form className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <input name="q" defaultValue={f.q} placeholder="Search" aria-label="Search" className={box} />
        <select name="cc" defaultValue={f.cc ?? ""} aria-label="Country" className={box}>
          <option value="">All countries</option>
          {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => <option key={c} value={c}>{COUNTRIES[c].name}</option>)}
        </select>
        <select name="mode" defaultValue={f.mode ?? ""} aria-label="Type" className={box}>
          <option value="">Buy, rent, invest</option>
          <option value="buy">For sale</option>
          <option value="rent">To rent</option>
          <option value="invest">Investment</option>
        </select>
        <select name="cat" defaultValue={f.cat ?? ""} aria-label="Category" className={box}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="sort" defaultValue={f.sort ?? ""} aria-label="Sort" className={box}>
          <option value="">Featured</option>
          <option value="lo">Price: low to high</option>
          <option value="hi">Price: high to low</option>
        </select>
        <button className="rounded bg-ink px-5 py-2 font-medium text-chalk">Apply</button>
      </form>
      <p className="mt-4 text-sm text-ink/70">{results.length} {results.length === 1 ? "property" : "properties"}</p>
      {results.length === 0 ? (
        <p className="mt-6">No properties match. Clear a filter or search a different city.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => <PropertyCard key={l.id} l={l} fee={inspectionFee(l, rates)} />)}
        </div>
      )}
    </main>
  );
}
