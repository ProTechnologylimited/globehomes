import Link from "next/link";
import ListingImage from "./ListingImage";
import { COUNTRIES, MODE_LABEL, type Listing } from "@/lib/data";
import { usd } from "@/lib/format";

export default function PropertyCard({ l, fee }: { l: Listing; fee: number }) {
  return (
    <Link href={`/properties/${l.id}`} className="group block overflow-hidden rounded-lg border border-line bg-white">
      <div className="relative h-44 overflow-hidden bg-mist">
        <ListingImage l={l} />
        <span className="absolute left-3 top-3 rounded bg-chalk/90 px-2 py-0.5 text-xs font-medium text-ink">
          {MODE_LABEL[l.mode]}
        </span>
        <span className="absolute right-3 top-3 text-2xl" aria-hidden>{COUNTRIES[l.cc].flag}</span>
      </div>
      <div className="p-4">
        <p className="font-display text-2xl">
          {usd(l.price)}
          {l.mode === "rent" && <span className="text-sm text-ink/60"> /month</span>}
        </p>
        <p className="mt-1 font-medium group-hover:underline">{l.title}</p>
        <p className="text-sm text-ink/70">{l.city}, {COUNTRIES[l.cc].name}</p>
        <p className="mt-2 text-sm text-ink/70">
          {l.beds} bed, {l.baths} bath, {l.sqm} m²{l.yield ? `, ${l.yield}% est. yield` : ""}
        </p>
        <p className="mt-3 inline-block rounded bg-mist px-2 py-1 text-xs text-moss">Inspection {usd(fee)}</p>
      </div>
    </Link>
  );
}
