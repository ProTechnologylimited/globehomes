import ListingForm from "@/components/ListingForm";
import ListingImage from "@/components/ListingImage";
import { COUNTRIES, MODE_LABEL } from "@/lib/data";
import { inspectionFee } from "@/lib/pricing";
import { getCategories, getListings, getRates } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";
import { usd } from "@/lib/format";
import { seedAction } from "../actions";

export default async function AdminListings() {
  const [list, cats, rates] = await Promise.all([getListings(true), getCategories(true), getRates()]);
  const db = supabaseAdmin();
  const count = db ? ((await db.from("listings").select("id", { count: "exact", head: true })).count ?? 0) : 0;

  if (!db || count === 0) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl">Listings and images</h1>
        <p className="mt-3 text-ink/75">
          The website is showing the built-in sample listings. Import them once to edit their photos,
          prices and categories here.
        </p>
        <form action={seedAction} className="mt-5">
          <button disabled={!db} className="rounded bg-ink px-5 py-3 font-medium text-chalk disabled:opacity-50">
            Import 25 sample listings
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl">Listings and images</h1>
      <details className="mt-4 rounded-lg border border-line bg-white">
        <summary className="cursor-pointer p-4 font-medium">Add a listing</summary>
        <ListingForm cats={cats} />
      </details>
      <ul className="mt-4 space-y-2">
        {list.map((l) => (
          <li key={l.id}>
            <details className="rounded-lg border border-line bg-white">
              <summary className="flex cursor-pointer items-center gap-3 p-3">
                <span className="block h-12 w-20 shrink-0 overflow-hidden rounded bg-mist"><ListingImage l={l} /></span>
                <span className="flex-1">
                  <b>{l.title}</b>
                  <span className="block text-sm text-ink/70">
                    {l.city}, {COUNTRIES[l.cc].name} · {MODE_LABEL[l.mode]} · {usd(l.price)} · inspection {usd(inspectionFee(l, rates))}
                    {l.active === false ? " · hidden" : ""}
                  </span>
                </span>
              </summary>
              <ListingForm l={l} cats={cats} />
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
