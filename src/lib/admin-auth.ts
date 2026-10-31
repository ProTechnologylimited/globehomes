import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "gh_admin";
const TTL_MS = 8 * 60 * 60 * 1000;

const sign = (v: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(v).digest("hex");

const same = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin-login");
}

export async function startSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.ADMIN_SESSION_SECRET || !same(password, expected)) return false;
  const exp = String(Date.now() + TTL_MS);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
  return true;
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
