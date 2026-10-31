import { supabaseAdmin } from "./supabase";
import { DEFAULT_RATES, type Rates } from "./pricing";
import { DEFAULT_CATEGORIES, LISTINGS, type Category, type Listing } from "./data";

// Read helpers. Each falls back to built-in sample data when Supabase is not configured or empty.

export async function getRates(): Promise<Rates> {
  const db = supabaseAdmin();
  if (!db) return DEFAULT_RATES;
  const { data } = await db.from("settings").select("value").eq("key", "rates").maybeSingle();
  return { ...DEFAULT_RATES, ...((data?.value as Partial<Rates>) ?? {}) };
}

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const db = supabaseAdmin();
  let list = DEFAULT_CATEGORIES;
  if (db) {
    const { data } = await db.from("categories").select("slug,name,active").order("sort").order("name");
    if (data?.length) list = data as Category[];
  }
  return includeInactive ? list : list.filter((c) => c.active);
}

type Row = {
  id: string; cc: Listing["cc"]; city: string; title: string; mode: Listing["mode"];
  category: string; price: number; beds: number; baths: number; sqm: number;
  yield: number | null; image_url: string | null; inspection_fee_override: number | null; active: boolean;
};

const fromRow = (r: Row): Listing => ({
  id: r.id, cc: r.cc, city: r.city, title: r.title, mode: r.mode, cat: r.category,
  price: r.price, beds: r.beds, baths: r.baths, sqm: r.sqm,
  yield: r.yield ?? undefined, image: r.image_url ?? undefined,
  feeOverride: r.inspection_fee_override ?? undefined, active: r.active,
});

export async function getListings(includeHidden = false): Promise<Listing[]> {
  const db = supabaseAdmin();
  let list = LISTINGS;
  if (db) {
    const { data, error } = await db.from("listings").select("*").order("created_at");
    if (!error && data?.length) list = (data as Row[]).map(fromRow);
  }
  return includeHidden ? list : list.filter((l) => l.active !== false);
}

export async function getListing(id: string): Promise<Listing | undefined> {
  return (await getListings(false)).find((l) => l.id === id);
}
