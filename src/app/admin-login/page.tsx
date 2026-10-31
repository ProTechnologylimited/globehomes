import { loginAction } from "../admin/actions";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl">Admin sign in</h1>
      <form action={loginAction} className="mt-6 space-y-4">
        <label className="block text-sm">
          Password
          <input name="password" type="password" required autoComplete="current-password"
            className="mt-1 w-full rounded border border-line bg-white px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">Wrong password. Try again.</p>}
        <button className="w-full rounded bg-ink px-4 py-3 font-medium text-chalk">Sign in</button>
      </form>
    </main>
  );
}
