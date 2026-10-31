"use client";

import { useState } from "react";
import { usd } from "@/lib/format";

export default function InspectionForm({
  listingId,
  baseFee,
  priorityFee,
}: {
  listingId: string;
  baseFee: number;
  priorityFee: number;
}) {
  const [priority, setPriority] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = baseFee + (priority ? priorityFee : 0);
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name: f.get("name"),
          email: f.get("email"),
          date: f.get("date"),
          priority,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start payment");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded border border-line bg-white px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">Full name
        <input name="name" required minLength={2} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm">Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="block text-sm">Preferred inspection date
        <input name="date" type="date" required min={today} className={field} />
      </label>
      {priorityFee > 0 && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)} />
          Priority report within 48 hours (+{usd(priorityFee)})
        </label>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded bg-ink px-4 py-3 font-medium text-chalk disabled:opacity-60">
        {busy ? "Opening secure checkout…" : `Pay ${usd(total)} with Stripe`}
      </button>
    </form>
  );
}
