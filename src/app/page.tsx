import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { COUNTRIES, type CountryCode } from "@/lib/data";
import { inspectionFee } from "@/lib/pricing";
import { getCategories, getListings, getRates } from "@/lib/store";
import { usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [listings, cats, rates] = await Promise.all([getListings(), getCategories(), getRates()]);
  const codes = (Object.keys(COUNTRIES) as CountryCode[]).filter((cc) => listings.some((l) => l.cc === cc));
  const byCountry = codes.map((cc) => {
    const items = listings.filter((l) => l.cc === cc);
    const sale = items.filter((l) => l.mode !== "rent").map((l) => l.price);
    return { cc, count: items.length, from: sale.length ? Math.min(...sale) : null };
  });
  const recent = listings.slice(-6).reverse();

  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-14">
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Inspected before you commit.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/75">
          Homes to buy, rent and invest in across {codes.length} countries. Every listing has a
          professional inspection you can book and pay for in minutes.
        </p>
        <form action="/properties" className="mt-8 grid max-w-3xl gap-2 sm:grid-cols-[2fr_1fr_auto]">
          <input name="q" placeholder="City, country or property" aria-label="Search"
            className="rounded border border-line bg-white px-3 py-3" />
          <select name="mode" aria-label="Type" className="rounded border border-line bg-white px-3 py-3">
            <option value="">Buy, rent or invest</option>
            <option value="buy">For sale</option>
            <option value="rent">To rent</option>
            <option value="invest">Investment</option>
          </select>
          <button className="rounded bg-ink px-6 py-3 font-medium text-chalk">Search homes</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link key={c.slug} href={`/properties?cat=${c.slug}`}
              className="rounded-full border border-line bg-white px-4 py-1.5 text-sm hover:bg-mist">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Recently added</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((l) => <PropertyCard key={l.id} l={l} fee={inspectionFee(l, rates)} />)}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl">Browse by country</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {byCountry.map(({ cc, count, from }) => (
            <li key={cc}>
              <Link href={`/properties?cc=${cc}`} className="flex items-center justify-between py-3 hover:bg-mist">
                <span><span aria-hidden>{COUNTRIES[cc].flag}</span> {COUNTRIES[cc].name}</span>
                <span className="text-sm text-ink/70">
                  {count} {count > 1 ? "properties" : "property"}{from ? `, from ${usd(from)}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-2xl">How inspection pricing works</h2>
        <p className="mt-2 text-ink/75">
          Homes for sale and investment are inspected for {rates.salePct}% of the price, between{" "}
          {usd(rates.saleMin)} and {usd(rates.saleMax)}. Rentals cost {rates.rentPct}% of one month&rsquo;s
          rent, between {usd(rates.rentMin)} and {usd(rates.rentMax)}. You see the exact fee on every
          listing and pay it online before the inspector is booked.
        </p>
      </section>
    </main>
  );
}
