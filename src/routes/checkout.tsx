import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AlertCircle, Check, ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { cartTotals, useCart } from "@/store/cart";
import { formatINR } from "@/lib/format";
import { APP_MODE } from "@/lib/config";
import { customerSchema } from "@/lib/checkout-schema";
import { runCheckout, type PaymentState } from "@/services/payments";
import { rememberOrder } from "@/services/orders";
import { trackEvent } from "@/services/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | Pragati Patola Art" },
      {
        name: "description",
        content:
          "Complete your Patola order with contact, shipping and payment details. Insured dispatch from Patan, Gujarat.",
      },
      { property: "og:title", content: "Secure Checkout — Pragati Patola Art" },
      { property: "og:description", content: "Complete your handwoven Patola order." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = customerSchema;

type FormValues = z.infer<typeof schema>;

const STEPS = ["Contact", "Shipping", "Payment"] as const;

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const totals = cartTotals(items);
  const [step, setStep] = useState(0);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      whatsappConsent: true,
      address: "",
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  const busy = ["created", "processing", "verifying"].includes(paymentState);

  async function advance() {
    const fields: Array<keyof FormValues>[] = [
      ["fullName", "email", "phone", "whatsapp"],
      ["address", "city", "state", "postalCode", "country"],
    ];
    const valid = await form.trigger(fields[step] as Array<keyof FormValues>);
    if (!valid) return;
    trackEvent("checkout_step", { step: STEPS[step] });
    setStep((s) => Math.min(s + 1, 2));
  }

  async function onPay() {
    if (busy) return;
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    setPaymentError(null);
    trackEvent("checkout_start", { total: totals.grandTotal });

    const result = await runCheckout(
      {
        customer: values,
        lines: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
        expectedTotal: totals.grandTotal,
      },
      setPaymentState,
    );

    if (result.state !== "success") {
      setPaymentError(result.message);
      return;
    }

    rememberOrder(result.order);
    clearCart();
    navigate({ to: "/order/$orderId", params: { orderId: result.order.orderId } });
  }

  if (items.length === 0 && paymentState === "idle") {
    return (
      <>
        <PageHeader title="Checkout" />
        <div className="shell py-20 text-center">
          <p className="font-display text-2xl">There is nothing to check out</p>
          <p className="text-muted-foreground mt-3 text-sm">Add a piece to your bag to continue.</p>
          <Button variant="atelier" size="auto" className="mt-8" asChild>
            <Link to="/shop">Explore the collection</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Secure checkout" title="Complete your order" />

      <div className="shell grid gap-12 py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20 md:py-20">
        <div>
          {/* Steps */}
          <ol className="border-border flex gap-6 border-b pb-5">
            {STEPS.map((label, index) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[11px]",
                    index <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-cream text-muted-foreground",
                  )}
                >
                  {index < step ? <Check className="size-3" aria-hidden /> : index + 1}
                </span>
                <span className={cn("label-micro", index === step ? "" : "text-muted-foreground")}>
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <form className="mt-10 space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
            {step === 0 && (
              <>
                <Field form={form} name="fullName" label="Full name" autoComplete="name" />
                <Field form={form} name="email" label="Email" type="email" autoComplete="email" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field form={form} name="phone" label="Phone" autoComplete="tel" />
                  <Field form={form} name="whatsapp" label="WhatsApp number" />
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    {...form.register("whatsappConsent")}
                    className="accent-primary mt-1 size-4"
                  />
                  <span className="text-muted-foreground leading-[1.7]">
                    My WhatsApp number may be used for order-related communication.
                  </span>
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <Field form={form} name="address" label="Address" autoComplete="street-address" />
                <Field form={form} name="apartment" label="Apartment / building (optional)" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field form={form} name="city" label="City" autoComplete="address-level2" />
                  <Field form={form} name="state" label="State" autoComplete="address-level1" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    form={form}
                    name="postalCode"
                    label="Postal code"
                    autoComplete="postal-code"
                  />
                  <Field form={form} name="country" label="Country" autoComplete="country-name" />
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <div className="bg-cream/60 p-6">
                  <p className="label-small flex items-center gap-2">
                    <ShieldCheck className="size-4" aria-hidden /> Payment
                  </p>
                  <p className="text-muted-foreground mt-4 text-sm leading-[1.8]">
                    {APP_MODE === "demo"
                      ? "This store is running in demo mode. Payment is simulated end to end — no card is charged and no live gateway is contacted."
                      : "Pay securely with UPI, cards, netbanking or wallets through Razorpay. Card details are entered on Razorpay's secure window and never reach our servers."}
                  </p>
                  <ul className="text-muted-foreground mt-5 space-y-2 text-xs">
                    <li>Prices are re-validated against our catalogue before payment.</li>
                    <li>Payment signatures are verified before an order is confirmed.</li>
                    <li>
                      UPI payments are limited to ₹1,00,000 by most banks — use a card or netbanking
                      for higher-value pieces.
                    </li>
                    <li>Your details are used only for this order and its delivery.</li>
                  </ul>
                </div>

                {busy && (
                  <p className="text-muted-foreground mt-6 flex items-center gap-3 text-sm">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {paymentState === "created" && "Creating your order…"}
                    {paymentState === "processing" && "Complete the payment in the secure window…"}
                    {paymentState === "verifying" &&
                      "Confirming your payment — please don't close this page…"}
                  </p>
                )}

                {paymentError && (
                  <p
                    role="alert"
                    className="border-destructive/40 text-destructive mt-6 flex items-start gap-3 border p-4 text-sm"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {paymentError}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              {step > 0 && (
                <Button
                  type="button"
                  variant="atelierOutline"
                  size="auto"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={busy}
                >
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button type="button" variant="atelier" size="auto" onClick={advance}>
                  Continue
                </Button>
              ) : (
                <Button type="button" variant="atelier" size="auto" onClick={onPay} disabled={busy}>
                  {busy ? "Please wait…" : `Pay ${formatINR(totals.grandTotal)}`}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Order summary */}
        <aside className="bg-cream/60 h-fit p-6 md:p-8">
          <button
            type="button"
            className="flex w-full items-center justify-between lg:cursor-default"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
          >
            <span className="label-small">Your order</span>
            <ChevronDown
              className={cn("size-4 lg:hidden", summaryOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          <div className={cn("mt-6 space-y-5", summaryOpen ? "block" : "hidden lg:block")}>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <img src={item.image} alt="" loading="lazy" className="size-16 object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-display text-base">{item.name}</p>
                    <p className="text-muted-foreground label-micro mt-1">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm tabular-nums">{formatINR(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="border-border space-y-3 border-t pt-5 text-sm">
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
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums">{formatINR(totals.discount)}</dd>
              </div>
              <div className="border-border flex justify-between border-t pt-4 text-base">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(totals.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({
  form,
  name,
  label,
  type = "text",
  autoComplete,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  const error = form.formState.errors[name]?.message as string | undefined;
  return (
    <div>
      <label htmlFor={name} className="label-micro text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...form.register(name)}
        className="border-border focus-visible:border-primary mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
      />
      {error && (
        <p id={`${name}-error`} className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
