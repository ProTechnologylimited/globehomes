import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logoutAction } from "./actions";
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const connected = !!supabaseAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <nav className="flex flex-wrap gap-5 text-sm font-medium">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/listings">Listings and images</Link>
          <Link href="/admin/pricing">Inspection pricing</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/" className="text-ink/60">View site</Link>
        </nav>
        <form action={logoutAction}>
          <button className="text-sm text-ink/70 underline">Sign out</button>
        </form>
      </div>
      {!connected && (
        <p role="status" className="mt-4 rounded bg-amber-100 p-3 text-sm text-amber-900">
          Supabase is not connected, so changes cannot be saved. Add SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY and run supabase/schema.sql.
        </p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}
