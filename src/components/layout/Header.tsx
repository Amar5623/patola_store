import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchDialog } from "@/components/shop/SearchDialog";
import { BRAND } from "@/lib/config";
import { whatsappSupportLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", kind: "static" },
  { to: "/story", label: "Story", kind: "static" },
  { to: "/shop", label: "Catalog", kind: "static" },
  { to: "/policies/$slug", slug: "returns", label: "Return Policy", kind: "policy" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCart((s) => s.items);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const wishlistCount = useWishlist((s) => s.ids.length);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const overlay = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.getElementById("mobile-nav-close")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !overlay;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "bg-ivory/95 border-border border-b backdrop-blur-md"
            : "bg-transparent text-ivory",
        )}
      >
        <div className="shell">
          <div
            className={cn(
              "hidden items-center justify-between transition-all duration-500 lg:grid lg:grid-cols-3",
              solid ? "py-4" : "py-7",
            )}
          >
            <nav aria-label="Main" className="flex items-center gap-8">
              {NAV.map((item) =>
                item.kind === "policy" ? (
                  <Link
                    key={item.label}
                    to="/policies/$slug"
                    params={{ slug: item.slug }}
                    className="label-micro link-underline"
                    activeProps={{ className: "label-micro link-underline opacity-100" }}
                    inactiveProps={{ className: "label-micro link-underline opacity-75" }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="label-micro link-underline"
                    activeProps={{ className: "label-micro link-underline opacity-100" }}
                    inactiveProps={{ className: "label-micro link-underline opacity-75" }}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <Logo compact={solid} className="justify-self-center" />

            <div className="flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="label-micro flex items-center gap-2 opacity-75 transition-opacity hover:opacity-100"
              >
                <Search className="size-4" aria-hidden /> Search
              </button>
              <Link
                to="/wishlist"
                className="label-micro flex items-center gap-2 opacity-75 transition-opacity hover:opacity-100"
              >
                <Heart className="size-4" aria-hidden /> {wishlistCount > 0 && wishlistCount}
                <span className="sr-only">Wishlist</span>
              </Link>
              <a
                href={whatsappSupportLink()}
                target="_blank"
                rel="noreferrer"
                className="label-micro flex items-center gap-2 opacity-75 transition-opacity hover:opacity-100"
              >
                <MessageCircle className="size-4" aria-hidden /> Concierge
              </a>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="label-micro flex items-center gap-2 opacity-75 transition-opacity hover:opacity-100"
              >
                <ShoppingBag className="size-4" aria-hidden /> Bag ({count})
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-3 items-center py-4 lg:hidden">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
              className="justify-self-start"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <Logo compact className="justify-self-center" />
            <div className="flex items-center gap-4 justify-self-end">
              <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Bag, ${count} pieces`}
                onClick={() => setDrawerOpen(true)}
                className="relative"
              >
                <ShoppingBag className="size-5" aria-hidden />
                {count > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full text-[10px]">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div
          className={cn(
            "bg-charcoal/50 absolute inset-0 transition-opacity duration-500",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "bg-ivory absolute inset-y-0 left-0 w-[86%] max-w-sm px-6 py-8 transition-transform duration-500 ease-out",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="label-micro opacity-60">Menu</span>
            <button id="mobile-nav-close" type="button" className="-m-3 p-3" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav className="mt-12 flex flex-col gap-6" aria-label="Mobile">
            {NAV.map((item) =>
              item.kind === "policy" ? (
                <Link
                  key={item.label}
                  to="/policies/$slug"
                  params={{ slug: item.slug }}
                  className="font-display text-3xl"
                >
                  {item.label}
                </Link>
              ) : (
                <Link key={item.label} to={item.to} className="font-display text-3xl">
                  {item.label}
                </Link>
              ),
            )}
            <Link to="/wishlist" className="font-display text-3xl">
              Wishlist
            </Link>
            <Link to="/contact" className="font-display text-3xl">
              Contact
            </Link>
          </nav>
          <div className="border-border mt-12 border-t pt-8">
            <p className="label-micro opacity-60">WhatsApp Concierge</p>
            <a href={`tel:${BRAND.phoneDial}`} className="font-display mt-2 block text-xl">
              {BRAND.phoneDisplay}
            </a>
            <a
              href={whatsappSupportLink()}
              target="_blank"
              rel="noreferrer"
              className="label-micro text-primary mt-4 inline-flex items-center gap-2"
            >
              <MessageCircle className="size-4" aria-hidden /> Message us
            </a>
          </div>
          <div className="ikat-pattern mt-10 h-12" role="presentation" />
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
