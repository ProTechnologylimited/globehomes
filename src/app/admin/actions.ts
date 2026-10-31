"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { COUNTRIES, DEFAULT_CATEGORIES, LISTINGS, type CountryCode } from "@/lib/data";
import { DEFAULT_RATES } from "@/lib/pricing";

function client() {
  const c = supabaseAdmin();
  if (!c) throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return c;
}
function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}
const refresh = () => revalidatePath("/", "layout");

// ---- Session ----
export async function loginAction(fd: FormData) {
  const ok = await startSession(String(fd.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin-login?error=1");
}
export async function logoutAction() {
  await endSession();
  redirect("/admin-login");
}

// ---- Pricing ----
const Num = z.coerce.number().min(0);
const RatesSchema = z
  .object({
    salePct: Num.max(10), saleMin: Num, saleMax: Num,
    rentPct: Num.max(50), rentMin: Num, rentMax: Num,
    priority: Num,
  })
  .refine((r) => r.saleMin <= r.saleMax && r.rentMin <= r.rentMax, "Minimum must not exceed maximum");

export async function saveRatesAction(fd: FormData) {
  await requireAdmin();
  const rates = RatesSchema.parse(Object.fromEntries(fd));
  check(await client().from("settings").upsert({ key: "rates", value: rates }));
  refresh();
  redirect("/admin/pricing?saved=1");
}

// ---- Categories ----
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export async function addCategoryAction(fd: FormData) {
  await requireAdmin();
  const name = z.string().min(2).max(40).parse(String(fd.get("name") ?? "").trim());
  const slug = slugify(name);
  if (!slug) throw new Error("Use letters or numbers in the category name.");
  check(await client().from("categories").upsert({ slug, name, active: true }, { onConflict: "slug" }));
  refresh();
  redirect("/admin/categories");
}
export async function renameCategoryAction(fd: FormData) {
  await requireAdmin();
  const slug = String(fd.get("slug"));
  const name = z.string().min(2).max(40).parse(String(fd.get("name") ?? "").trim());
  check(await client().from("categories").update({ name }).eq("slug", slug));
  refresh();
  redirect("/admin/categories");
}
export async function toggleCategoryAction(fd: FormData) {
  await requireAdmin();
  const slug = String(fd.get("slug"));
  const active = fd.get("active") === "true";
  check(await client().from("categories").update({ active: !active }).eq("slug", slug));
  refresh();
  redirect("/admin/categories");
}
export async function deleteCategoryAction(fd: FormData) {
  await requireAdmin();
  const slug = String(fd.get("slug"));
  const c = client();
  const used = await c.from("listings").select("id", { count: "exact", head: true }).eq("category", slug);
  if ((used.count ?? 0) > 0) throw new Error("Move or hide the listings in this category before deleting it.");
  check(await c.from("categories").delete().eq("slug", slug));
  refresh();
  redirect("/admin/categories");
}

// ---- Listings ----
const ListingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  cc: z.enum(Object.keys(COUNTRIES) as [CountryCode, ...CountryCode[]]),
  mode: z.enum(["buy", "rent", "invest"]),
  category: z.string().min(1),
  price: z.coerce.number().int().min(1),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().int().min(0),
  sqm: z.coerce.number().int().min(0),
  yield: z.string().optional(),
  imageUrl: z.string().optional(),
  fee: z.string().optional(),
});

export async function saveListingAction(fd: FormData) {
  await requireAdmin();
  const p = ListingSchema.parse(Object.fromEntries(fd));
  const c = client();
  const id = p.id || `${p.cc.toLowerCase()}-${Date.now().toString(36)}`;

  let image: string | null = (p.imageUrl ?? "").trim() || null;
  if (image && !/^https:\/\//i.test(image)) throw new Error("Image URL must start with https://");
  if (fd.get("clearImage") === "on") image = null;

  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      throw new Error("Upload an image file under 5 MB.");
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${id}/${Date.now()}.${ext}`;
    const up = await c.storage.from("listing-images").upload(path, file, { contentType: file.type, upsert: true });
    if (up.error) throw new Error(up.error.message);
    image = c.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
  }

  const num = (v?: string) => (v && v.trim() !== "" ? Number(v) : null);
  check(
    await c.from("listings").upsert({
      id, title: p.title, city: p.city, cc: p.cc, mode: p.mode, category: p.category,
      price: p.price, beds: p.beds, baths: p.baths, sqm: p.sqm,
      yield: num(p.yield), image_url: image,
      inspection_fee_override: num(p.fee),
      active: fd.get("active") === "on",
    }),
  );
  refresh();
  redirect("/admin/listings");
}

export async function deleteListingAction(fd: FormData) {
  await requireAdmin();
  check(await client().from("listings").delete().eq("id", String(fd.get("id"))));
  refresh();
  redirect("/admin/listings");
}

/** One-time import of the sample data so it can be edited in the admin panel. */
export async function seedAction() {
  await requireAdmin();
  const c = client();
  check(
    await c.from("categories").upsert(
      DEFAULT_CATEGORIES.map((k, i) => ({ slug: k.slug, name: k.name, active: true, sort: i })),
      { onConflict: "slug", ignoreDuplicates: true },
    ),
  );
  check(await c.from("settings").upsert({ key: "rates", value: DEFAULT_RATES }, { onConflict: "key", ignoreDuplicates: true }));
  check(
    await c.from("listings").upsert(
      LISTINGS.map((l) => ({
        id: l.id, cc: l.cc, city: l.city, title: l.title, mode: l.mode, category: l.cat,
        price: l.price, beds: l.beds, baths: l.baths, sqm: l.sqm, yield: l.yield ?? null, active: true,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    ),
  );
  refresh();
  redirect("/admin/listings");
}
