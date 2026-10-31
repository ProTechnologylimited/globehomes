import { getCategories } from "@/lib/store";
import { addCategoryAction, deleteCategoryAction, renameCategoryAction, toggleCategoryAction } from "../actions";

export default async function CategoriesPage() {
  const cats = await getCategories(true);
  const box = "rounded border border-line bg-white px-3 py-2";
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">Housing categories</h1>
      <p className="mt-1 text-sm text-ink/70">Hidden categories disappear from the public filters. Listings keep their category.</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {cats.map((c) => (
          <li key={c.slug} className="flex flex-wrap items-center gap-2 py-3">
            <form action={renameCategoryAction} className="flex flex-1 gap-2">
              <input type="hidden" name="slug" value={c.slug} />
              <input name="name" defaultValue={c.name} aria-label={`Name for ${c.slug}`} className={`${box} flex-1`} />
              <button className="rounded border border-line px-3 text-sm">Rename</button>
            </form>
            <form action={toggleCategoryAction}>
              <input type="hidden" name="slug" value={c.slug} />
              <input type="hidden" name="active" value={String(c.active)} />
              <button className="rounded border border-line px-3 py-2 text-sm">{c.active ? "Hide" : "Show"}</button>
            </form>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="slug" value={c.slug} />
              <button className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Delete</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={addCategoryAction} className="mt-5 flex gap-2">
        <input name="name" required placeholder="New category, for example Penthouse" className={`${box} flex-1`} />
        <button className="rounded bg-ink px-5 py-2 font-medium text-chalk">Add category</button>
      </form>
    </div>
  );
}
