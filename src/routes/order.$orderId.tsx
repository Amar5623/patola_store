import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { getOrder, type OrderRecord } from "@/services/orders";
import { formatINR } from "@/lib/format";
import { whatsappOrderConfirmationLink } from "@/lib/whatsapp";
import { BRAND } from "@/lib/config";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmation | Pragati Patola Art" },
      {
        name: "description",
        content: "Your Pragati Patola Art order confirmation and next steps.",
      },
      { property: "og:title", content: "Order Confirmation — Pragati Patola Art" },
      { property: "og:description", content: "Your Patola order confirmation." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(getOrder(orderId) ?? null);
    setLoaded(true);
  }, [orderId]);

  return (
    <>
      <PageHeader
        eyebrow="Order confirmation"
        title={order ? "Thank you — your piece is reserved" : "Order reference"}
        description={
          order
            ? "A concierge will confirm dispatch details with you shortly. Please record an unboxing video when your parcel arrives."
            : undefined
        }
      />
      <div className="shell py-12 md:py-20">
        {!loaded ? (
          <p className="text-muted-foreground text-sm">Loading your order…</p>
        ) : !order ? (
          <div className="max-w-xl">
            <p className="font-display text-2xl">We could not find order {orderId}</p>
            <p className="text-muted-foreground mt-4 text-sm leading-[1.8]">
              Order details are shown only in the browser tab used for purchase. Your order is
              safely recorded with us — our concierge can confirm the details on WhatsApp or by
              phone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="atelier" size="auto" asChild>
                <Link to="/contact">Contact the atelier</Link>
              </Button>
              <Button variant="atelierOutline" size="auto" asChild>
                <Link to="/shop">Back to the collection</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            <div>
              <div className="bg-cream/60 flex items-start gap-4 p-6">
                <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="label-small">Order {order.orderId}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-[1.8]">
                    Payment status: {order.paymentStatus}
                    {order.mode === "demo" && " (demo mode — no funds were taken)"}
                    {order.mode === "test" && " (Razorpay test mode — no real money was charged)"}
                    {order.paymentId && (
                      <>
                        <br />
                        Payment ID: {order.paymentId}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <h2 className="label-small mt-12">Pieces</h2>
              <ul className="mt-5">
                {order.items.map((item) => (
                  <li
                    key={item.sku}
                    className="border-border flex justify-between gap-4 border-b py-4"
                  >
                    <span>
                      <span className="font-display block text-lg">{item.name}</span>
                      <span className="label-micro text-muted-foreground">
                        {item.sku} · Qty {item.quantity}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="label-small mt-12">Delivering to</h2>
              <address className="text-muted-foreground mt-4 text-sm leading-[1.9] not-italic">
                {order.customer.fullName}
                <br />
                {order.customer.address}
                {order.customer.apartment ? `, ${order.customer.apartment}` : ""}
                <br />
                {order.customer.city}, {order.customer.state} {order.customer.postalCode}
                <br />
                {order.customer.country}
              </address>

              <div className="border-border mt-12 border-t pt-8">
                <h2 className="label-small flex items-center gap-2">
                  <Truck className="size-4" aria-hidden /> What happens next
                </h2>
                <ol className="text-muted-foreground mt-5 space-y-3 text-sm leading-[1.8]">
                  <li>1. Your piece is documented and packed at the atelier.</li>
                  <li>2. Insured dispatch, with tracking shared on WhatsApp.</li>
                  <li>
                    3. Record an unboxing video of the sealed parcel — it supports the 2-day return
                    and replacement window.
                  </li>
                </ol>
              </div>
            </div>

            <aside className="bg-cream/60 h-fit p-8">
              <h2 className="label-small">Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}
                  </dd>
                </div>
                <div className="border-border flex justify-between border-t pt-4 text-base">
                  <dt>Total paid</dt>
                  <dd className="tabular-nums">{formatINR(order.total)}</dd>
                </div>
              </dl>
              <div className="mt-8 space-y-3">
                <Button variant="concierge" size="auto" className="w-full" asChild>
                  <a
                    href={whatsappOrderConfirmationLink({
                      orderId: order.orderId,
                      name: order.customer.fullName,
                      total: order.total,
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden /> Confirm on WhatsApp
                  </a>
                </Button>
                <Button variant="atelierOutline" size="auto" className="w-full" asChild>
                  <Link to="/shop">Continue exploring</Link>
                </Button>
              </div>
              <p className="text-muted-foreground mt-6 text-xs leading-[1.7]">
                Questions? Call {BRAND.phoneDisplay}.
              </p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
