"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { itemCount, ready } = useCart();
  const pathname = usePathname();

  return (
    <>
      <div className="prototype-note">
        <b>Prototype.</b> Clickable, but nothing is saved to an account and no payment is taken.
      </div>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href="/" className="wordmark">
            <span className="wordmark__mark" aria-hidden="true">
              B
            </span>
            Buildour
          </Link>

          <nav className="site-nav" aria-label="Main">
            <Link
              href="/systems"
              className="site-nav__link"
              aria-current={pathname.startsWith("/systems") ? "page" : undefined}
            >
              Browse systems
            </Link>
            <Link
              href="/profile"
              className="site-nav__link"
              aria-current={pathname.startsWith("/profile") ? "page" : undefined}
            >
              My business
            </Link>
            <Link href="/cart" className="cart-pill">
              Cart
              <span className="cart-pill__count tnum">{ready ? itemCount : 0}</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
