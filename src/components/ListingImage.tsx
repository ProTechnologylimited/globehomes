import HouseFront from "./HouseFront";
import type { Listing } from "@/lib/data";

export default function ListingImage({
  l,
}: {
  l: Pick<Listing, "id" | "cat" | "image" | "title" | "city">;
}) {
  if (l.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={l.image} alt={`${l.title}, ${l.city}`} className="h-full w-full object-cover" loading="lazy" />;
  }
  return <HouseFront id={l.id} cat={l.cat} />;
}
