import { Link } from "@tanstack/react-router";
import { Minus, Plus, MessageCircle, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cartTotals, useCart } from "@/store/cart";
import { formatINR } from "@/lib/format";
import { whatsappCartLink } from "@/lib/whatsapp";
import { FreeShippingMeter } from "./FreeShippingMeter";

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCart();
  const totals = cartTotals(items);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="bg-ivory flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="border-border flex items-center justify-between border-b px-6 py-5">
          <div>
            <SheetTitle className="font-display text-xl">Your Collection</SheetTitle>
            <p className="label-micro text-muted-foreground mt-1">
              {totals.count} {totals.count === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button type="button" aria-label="Close bag" onClick={() => setDrawerOpen(false)}>
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="ikat-pattern h-16 w-24" role="presentation" />
            <p className="font-display mt-6 text-2xl">Your bag is empty</p>
            <p className="text-muted-foreground mt-3 text-sm leading-[1.8]">
              Begin with the signature collection, or ask a concierge to guide your selection.
            </p>
            <Button variant="atelier" size="auto" className="mt-8" asChild>
              <Link to="/shop" onClick={() => setDrawerOpen(false)}>
                Explore the collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.id} className="border-border flex gap-4 border-b py-6">
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => setDrawerOpen(false)}
                    className="bg-cream block size-24 shrink-0"
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1">
                    <p className="font-display text-lg leading-tight">{item.name}</p>
                    <p className="label-micro text-muted-foreground mt-1">{item.technique}</p>
                    <p className="mt-2 text-sm tabular-nums">{formatINR(item.price)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="border-border flex items-center border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-2.5 py-1.5"
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-8 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => increaseQuantity(item.id)}
                          className="px-2.5 py-1.5"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-crimson transition-colors"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-border space-y-5 border-t px-6 py-6">
              <FreeShippingMeter subtotal={totals.subtotal} />
              <div className="flex items-center justify-between text-sm">
                <span className="label-micro text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatINR(totals.subtotal)}</span>
              </div>
              <div className="space-y-3">
                <Button variant="atelier" size="auto" className="w-full" asChild>
                  <Link to="/checkout" onClick={() => setDrawerOpen(false)}>
                    Checkout via Razorpay
                  </Link>
                </Button>
                <Button variant="concierge" size="auto" className="w-full" asChild>
                  <a
                    href={whatsappCartLink(items, totals.grandTotal)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden /> Speak to a Patola concierge
                  </a>
                </Button>
                <Link
                  to="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="label-micro text-muted-foreground block text-center"
                >
                  Continue exploring →
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
