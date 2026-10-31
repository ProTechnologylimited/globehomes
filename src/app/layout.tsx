import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlobeHomes: buy, rent, invest and inspect worldwide",
  description:
    "Homes to buy, rent and invest in across 12 countries, each with a bookable professional inspection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-line">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-display text-xl">GlobeHomes</Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/properties?mode=buy">Buy</Link>
              <Link href="/properties?mode=rent">Rent</Link>
              <Link href="/properties?mode=invest">Invest</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10 text-xs text-ink/60">
          Sample listings with indicative prices from published 2026 market ranges, not live offers.
          Inspection fees are set by GlobeHomes and shown before payment.
        </footer>
      </body>
    </html>
  );
}
