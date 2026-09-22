import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./app.css";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Buildour Systems",
  description:
    "Choose the system your business needs, down to the last detail, and leave with a plan that builds it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader />
          <main id="main">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
