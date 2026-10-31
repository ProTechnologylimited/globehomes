import type { Mode } from "./pricing";

export type CountryCode =
  | "US" | "GB" | "FR" | "ES" | "PT" | "IT"
  | "AE" | "SG" | "NG" | "TR" | "AU" | "CA";

export const COUNTRIES: Record<CountryCode, { name: string; flag: string }> = {
  US: { name: "United States", flag: "🇺🇸" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  FR: { name: "France", flag: "🇫🇷" },
  ES: { name: "Spain", flag: "🇪🇸" },
  PT: { name: "Portugal", flag: "🇵🇹" },
  IT: { name: "Italy", flag: "🇮🇹" },
  AE: { name: "UAE", flag: "🇦🇪" },
  SG: { name: "Singapore", flag: "🇸🇬" },
  NG: { name: "Nigeria", flag: "🇳🇬" },
  TR: { name: "Türkiye", flag: "🇹🇷" },
  AU: { name: "Australia", flag: "🇦🇺" },
  CA: { name: "Canada", flag: "🇨🇦" },
};

export type Category = { slug: string; name: string; active: boolean };

export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "villa", name: "Villa", active: true },
  { slug: "house", name: "House", active: true },
  { slug: "townhouse", name: "Townhouse", active: true },
  { slug: "apartment", name: "Apartment", active: true },
  { slug: "condo", name: "Condo", active: true },
  { slug: "estate", name: "Estate and farm", active: true },
];

export type Listing = {
  id: string;
  cc: CountryCode;
  city: string;
  title: string;
  mode: Mode;
  cat: string;
  /** USD. For rentals this is per month. */
  price: number;
  beds: number;
  baths: number;
  sqm: number;
  yield?: number;
  /** Photo URL set in the admin panel. When empty a front-view illustration is drawn. */
  image?: string;
  /** Fixed inspection fee in USD that replaces the formula. */
  feeOverride?: number;
  active?: boolean;
};

// SAMPLE DATA: indicative prices from published 2026 market ranges, not live offers.
type Row = [CountryCode, string, string, string, Mode, number, number, number, number, number?];
const rows: Row[] = [
  ["US", "Miami Beach", "Waterfront villa with dock", "villa", "buy", 6900000, 5, 6, 420],
  ["US", "Austin", "Modern hill-country home", "house", "buy", 1150000, 4, 3, 260],
  ["US", "Brooklyn", "Designer loft, Dumbo", "apartment", "rent", 6800, 2, 2, 140],
  ["GB", "London", "Kensington stucco townhouse", "townhouse", "buy", 5400000, 5, 4, 320],
  ["GB", "Manchester", "City-centre apartment", "apartment", "invest", 285000, 2, 2, 78, 6.1],
  ["FR", "Paris 16e", "Haussmann apartment, Trocadéro", "apartment", "buy", 2700000, 3, 2, 150],
  ["FR", "Saint-Rémy-de-Provence", "Provençal mas with pool", "estate", "buy", 3500000, 6, 5, 380],
  ["ES", "Marbella", "Golden Mile hillside villa", "villa", "buy", 3100000, 5, 5, 450],
  ["ES", "Barcelona", "Eixample balcony flat", "apartment", "rent", 3200, 3, 2, 115],
  ["PT", "Vale do Lobo, Algarve", "Contemporary golf-front villa", "villa", "buy", 7000000, 5, 6, 520],
  ["PT", "Lisbon", "Renovated Chiado apartment", "apartment", "invest", 670000, 2, 2, 95, 5.2],
  ["IT", "Lake Como", "Lakefront villa with jetty", "villa", "buy", 5200000, 6, 6, 480],
  ["IT", "Puglia", "Restored masseria and olive grove", "estate", "buy", 1500000, 7, 6, 600],
  ["AE", "Palm Jumeirah", "Signature beach villa", "villa", "buy", 7500000, 5, 6, 600],
  ["AE", "Dubai Marina", "Sea-view 2-bed apartment", "apartment", "invest", 620000, 2, 2, 115, 7.0],
  ["SG", "Orchard", "Prime freehold condo", "condo", "buy", 6400000, 3, 3, 186],
  ["SG", "Marina Bay", "High-floor apartment", "condo", "rent", 9500, 2, 2, 110],
  ["NG", "Ikoyi, Lagos", "5-bed detached duplex", "house", "buy", 1200000, 5, 6, 520],
  ["NG", "Lekki, Lagos", "Serviced 3-bed apartment", "apartment", "invest", 240000, 3, 3, 170, 8.4],
  ["TR", "Istanbul", "Bosphorus-view apartment", "apartment", "buy", 1100000, 3, 3, 190],
  ["TR", "Antalya", "Garden villa with pool", "villa", "invest", 420000, 4, 3, 210, 6.8],
  ["AU", "Sydney", "Mosman harbour-view house", "house", "buy", 4300000, 5, 4, 330],
  ["AU", "Melbourne", "South Yarra apartment", "apartment", "rent", 2900, 2, 2, 98],
  ["CA", "Toronto", "Yorkville luxury condo", "condo", "buy", 1900000, 2, 2, 120],
  ["CA", "Vancouver", "West Side family house", "house", "buy", 3400000, 5, 4, 310],
];

export const LISTINGS: Listing[] = rows.map((r, i) => ({
  id: `${r[0].toLowerCase()}-${i + 1}`,
  cc: r[0], city: r[1], title: r[2], cat: r[3], mode: r[4],
  price: r[5], beds: r[6], baths: r[7], sqm: r[8], yield: r[9], active: true,
}));

export const MODE_LABEL: Record<Mode, string> = {
  buy: "For sale", rent: "To rent", invest: "Investment",
};

export type Filters = { cc?: string; mode?: string; cat?: string; q?: string; sort?: string };

export function filterListings(list: Listing[], { cc, mode, cat, q, sort }: Filters): Listing[] {
  const needle = q?.trim().toLowerCase();
  const out = list.filter(
    (l) =>
      (!cc || l.cc === cc) &&
      (!mode || l.mode === mode) &&
      (!cat || l.cat === cat) &&
      (!needle || `${l.city} ${l.title} ${COUNTRIES[l.cc].name}`.toLowerCase().includes(needle)),
  );
  if (sort === "lo") out.sort((a, b) => a.price - b.price);
  if (sort === "hi") out.sort((a, b) => b.price - a.price);
  return out;
}
