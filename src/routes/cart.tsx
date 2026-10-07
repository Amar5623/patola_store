import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { FreeShippingMeter } from "@/components/cart/FreeShippingMeter";
import { cartTotals, useCart } from "@/store/cart";
import { formatINR } from "@/lib/format";
import { whatsappCartLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag | Pragati Patola Art" },
      {
        name: "description",
        content: "Review the Patola pieces in your bag, adjust quantities and proceed to checkout.",
      },
      { property: "og:title", content: "Your Bag — Pragati Patola Art" },
      { property: "og:description", content: "Review your selected Patola pieces." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const totals = cartTotals(items);

  return (
    <>
      <PageHeader
        eyebrow={`${totals.count} ${totals.count === 1 ? "piece" : "pieces"}`}
        title="Your Bag"
      />
      <div className="shell py-12 md:py-20">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="ikat-pattern mx-auto h-12 w-28" role="presentation" />
            <p className="font-display mt-8 text-2xl">Your bag is empty</p>
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-[1.8]">
              Begin with the signature collection, or let a concierge guide your selection by
              occasion and motif.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="atelier" size="auto" asChild>
                <Link to="/shop">Explore the collection</Link>
              </Button>
              <Button variant="concierge" size="auto" asChild>
                <Link to="/contact">Speak to a concierge</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <ul>
              {items.map((item) => (
                <li key={item.id} className="border-border flex gap-5 border-b py-8 first:pt-0">
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    className="bg-cream block w-28 shrink-0 md:w-36"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl">
                          <Link to="/product/$slug" params={{ slug: item.slug }} className="link-underline">
                            {item.name}
                          </Link>
                        </h2>
                        <p className="label-micro text-muted-foreground mt-2">
                          {item.technique} · SKU {item.sku}
                        </p>
                      </div>
                      <p className="tabular-nums">{formatINR(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-5">
                      <div className="border-border flex items-center border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-3 py-2"
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
                          className="px-3 py-2"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-crimson label-micro flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="size-4" aria-hidden /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="bg-cream/60 h-fit p-8">
              <h2 className="label-small">Order summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {totals.shipping === 0 ? "Complimentary" : formatINR(totals.shipping)}
                  </dd>
                </div>
                <div className="border-border flex justify-between border-t pt-4 text-base">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatINR(totals.grandTotal)}</dd>
                </div>
              </dl>
              <div className="mt-7">
                <FreeShippingMeter subtotal={totals.subtotal} />
              </div>
              <div className="mt-8 space-y-3">
                <Button variant="atelier" size="auto" className="w-full" asChild>
                  <Link to="/checkout">Checkout via Razorpay</Link>
                </Button>
                <Button variant="concierge" size="auto" className="w-full" asChild>
                  <a href={whatsappCartLink(items, totals.grandTotal)} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" aria-hidden /> Speak to a concierge
                  </a>
                </Button>
                <Link to="/shop" className="label-micro text-muted-foreground block text-center">
                  Continue exploring →
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
