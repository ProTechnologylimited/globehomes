export type Mode = "buy" | "rent" | "invest";

export type Rates = {
  salePct: number; // % of price, sale and investment
  saleMin: number;
  saleMax: number;
  rentPct: number; // % of one month's rent
  rentMin: number;
  rentMax: number;
  priority: number; // flat add-on for a 48h report
};

export const DEFAULT_RATES: Rates = {
  salePct: 0.08, saleMin: 249, saleMax: 1499,
  rentPct: 4, rentMin: 129, rentMax: 399,
  priority: 79,
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Priced = { price: number; mode: Mode; feeOverride?: number | null };

/** Fee in whole USD. A per-listing override set in the admin panel wins. */
export function inspectionFee(l: Priced, r: Rates = DEFAULT_RATES): number {
  if (l.feeOverride && l.feeOverride > 0) return Math.round(l.feeOverride);
  const raw =
    l.mode === "rent"
      ? clamp((l.price * r.rentPct) / 100, r.rentMin, r.rentMax)
      : clamp((l.price * r.salePct) / 100, r.saleMin, r.saleMax);
  return Math.max(1, Math.round(raw / 10) * 10 - 1);
}

export const totalFee = (l: Priced, priority: boolean, r: Rates = DEFAULT_RATES) =>
  inspectionFee(l, r) + (priority ? r.priority : 0);
