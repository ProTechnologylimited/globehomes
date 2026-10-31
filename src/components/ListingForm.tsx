import ListingImage from "./ListingImage";
import { COUNTRIES, type Category, type CountryCode, type Listing } from "@/lib/data";
import { deleteListingAction, saveListingAction } from "@/app/admin/actions";

const box = "mt-1 w-full rounded border border-line bg-white px-3 py-2";

export default function ListingForm({ l, cats }: { l?: Listing; cats: Category[] }) {
  return (
    <div className="grid gap-6 p-4 md:grid-cols-[260px_1fr]">
      <div>
        <div className="h-40 overflow-hidden rounded border border-line bg-mist">
          {l ? <ListingImage l={l} /> : <p className="p-4 text-sm text-ink/70">The image appears after you save.</p>}
        </div>
        {l && (
          <form action={deleteListingAction} className="mt-3">
            <input type="hidden" name="id" value={l.id} />
            <button className="text-sm text-red-700 underline">Delete this listing</button>
          </form>
        )}
      </div>
      <form action={saveListingAction} className="grid gap-3 sm:grid-cols-2">
        {l && <input type="hidden" name="id" value={l.id} />}
        <label className="text-sm sm:col-span-2">Title<input name="title" required defaultValue={l?.title} className={box} /></label>
        <label className="text-sm">City or address<input name="city" required defaultValue={l?.city} className={box} /></label>
        <label className="text-sm">Country
          <select name="cc" defaultValue={l?.cc ?? "US"} className={box}>
            {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => <option key={c} value={c}>{COUNTRIES[c].name}</option>)}
          </select>
        </label>
        <label className="text-sm">Listing type
          <select name="mode" defaultValue={l?.mode ?? "buy"} className={box}>
            <option value="buy">For sale</option><option value="rent">To rent</option><option value="invest">Investment</option>
          </select>
        </label>
        <label className="text-sm">Category
          <select name="category" defaultValue={l?.cat ?? cats[0]?.slug} className={box}>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Price in USD (rent per month)<input name="price" type="number" min={1} required defaultValue={l?.price} className={box} /></label>
        <label className="text-sm">Fixed inspection fee in USD (optional)<input name="fee" type="number" min={1} defaultValue={l?.feeOverride} className={box} /></label>
        <label className="text-sm">Bedrooms<input name="beds" type="number" min={0} required defaultValue={l?.beds ?? 3} className={box} /></label>
        <label className="text-sm">Bathrooms<input name="baths" type="number" min={0} required defaultValue={l?.baths ?? 2} className={box} /></label>
        <label className="text-sm">Size in m²<input name="sqm" type="number" min={0} required defaultValue={l?.sqm ?? 100} className={box} /></label>
        <label className="text-sm">Est. yield % (investment)<input name="yield" type="number" step="0.1" defaultValue={l?.yield} className={box} /></label>
        <label className="text-sm sm:col-span-2">Front-view photo URL (https)<input name="imageUrl" defaultValue={l?.image} placeholder="https://…" className={box} /></label>
        <label className="text-sm sm:col-span-2">Or upload a photo (max 5 MB)<input name="image" type="file" accept="image/*" className={box} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="clearImage" /> Remove photo and use the drawn front view</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={l?.active ?? true} /> Visible on the website</label>
        <button className="rounded bg-ink px-5 py-3 font-medium text-chalk sm:col-span-2">{l ? "Save changes" : "Add listing"}</button>
      </form>
    </div>
  );
}
