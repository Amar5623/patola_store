import { APP_MODE, BRAND } from "@/lib/config";
import type { CustomerDetails } from "@/lib/checkout-schema";
import { describeQuoteError, quoteCart, type CartLineInput } from "@/lib/pricing";
import { confirmPayment, createCheckout } from "@/functions/checkout.functions";
import { trackEvent } from "./analytics";
import type { OrderRecord } from "./orders";

export type PaymentState =
  "idle" | "created" | "processing" | "verifying" | "success" | "failed" | "cancelled";

export type PaymentResult =
  | { state: "success"; order: OrderRecord }
  | { state: "failed" | "cancelled"; message: string; code?: string };

export interface CheckoutInput {
  customer: CustomerDetails;
  lines: CartLineInput[];
  /** Total shown to the shopper, in rupees. */
  expectedTotal: number;
}

/**
 * Payment service abstraction.
 *
 * Demo mode (VITE_APP_MODE=demo, the default): the lifecycle is simulated in
 * the browser. No gateway or server is contacted, so previews can never charge
 * a card or write to the order sheet.
 *
 * Production mode (VITE_APP_MODE=production):
 *   1. `createCheckout` (server) re-prices the cart from the catalogue and
 *      creates a Razorpay order whose notes carry the full order.
 *   2. Razorpay Checkout opens with the public key id returned by the server.
 *   3. `confirmPayment` (server) verifies the HMAC signature, re-fetches the
 *      payment from Razorpay and logs the order to the Google Sheet.
 *   4. The /api/public/razorpay-webhook route logs the same order if the
 *      browser never reaches step 3.
 * Test vs live is decided by the server's RAZORPAY_KEY_ID (rzp_test_ / rzp_live_).
 */
export async function runCheckout(
  input: CheckoutInput,
  onState: (state: PaymentState) => void,
): Promise<PaymentResult> {
  onState("created");
  trackEvent("payment_initiated", { amount: input.expectedTotal, mode: APP_MODE });
  const result =
    APP_MODE === "production"
      ? await runRazorpayCheckout(input, onState)
      : await runDemo(input, onState);
  onState(result.state);
  if (result.state === "success") {
    trackEvent("payment_success", { orderId: result.order.orderId, amount: result.order.total });
  } else {
    trackEvent(result.state === "cancelled" ? "payment_cancelled" : "payment_failed", {
      code: result.code ?? "unknown",
    });
  }
  return result;
}

/* --------------------------------- Demo --------------------------------- */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo(
  input: CheckoutInput,
  onState: (state: PaymentState) => void,
): Promise<PaymentResult> {
  const priced = quoteCart(input.lines);
  if (!priced.ok) return { state: "failed", message: describeQuoteError(priced.error) };
  const { quote } = priced;

  await wait(500);
  onState("processing");
  await wait(1200);
  onState("verifying");
  await wait(700);

  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return {
    state: "success",
    order: {
      orderId: `PPA-DEMO-${suffix.toUpperCase()}`,
      createdAt: new Date().toISOString(),
      customer: input.customer,
      items: quote.lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        price: l.unitPrice,
        quantity: l.quantity,
      })),
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      discount: quote.discount,
      total: quote.total,
      paymentStatus: "paid",
      paymentId: `pay_demo_${suffix}`,
      mode: "demo",
    },
  };
}

/* ------------------------------- Razorpay ------------------------------- */

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(
    event: "payment.failed",
    handler: (response: { error?: { description?: string } }) => void,
  ): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | undefined;

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = undefined;
      script.remove();
      reject(new Error("Razorpay Checkout failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

async function runRazorpayCheckout(
  input: CheckoutInput,
  onState: (state: PaymentState) => void,
): Promise<PaymentResult> {
  let created;
  try {
    [created] = await Promise.all([createCheckout({ data: input }), loadCheckoutScript()]);
  } catch {
    return {
      state: "failed",
      code: "NETWORK",
      message:
        "We could not start the secure payment window. Please check your connection (and disable any ad blocker) and try again.",
    };
  }
  if (!created.ok) return { state: "failed", code: created.code, message: created.message };

  onState("processing");

  const outcome = await new Promise<
    { kind: "paid"; response: RazorpaySuccess } | { kind: "dismissed"; lastError?: string }
  >((resolve) => {
    let lastError: string | undefined;
    const rzp = new window.Razorpay!({
      key: created.keyId,
      order_id: created.razorpayOrderId,
      amount: created.amountPaise,
      currency: "INR",
      name: BRAND.name,
      description: `Order ${created.orderRef}`,
      prefill: {
        name: input.customer.fullName,
        email: input.customer.email,
        contact: input.customer.phone.replace(/[\s-]/g, ""),
      },
      notes: { order_ref: created.orderRef },
      theme: { color: "#7a1f2b" },
      retry: { enabled: true },
      modal: {
        confirm_close: true,
        ondismiss: () =>
          resolve(lastError ? { kind: "dismissed", lastError } : { kind: "dismissed" }),
      },
      handler: (response: RazorpaySuccess) => resolve({ kind: "paid", response }),
    });
    // Failed attempts keep the modal open so the shopper can retry another method.
    rzp.on("payment.failed", (response) => {
      lastError = response.error?.description;
    });
    rzp.open();
  });

  if (outcome.kind === "dismissed") {
    return outcome.lastError
      ? {
          state: "failed",
          code: "PAYMENT_FAILED",
          message: `Payment failed: ${outcome.lastError}. No money has been taken.`,
        }
      : {
          state: "cancelled",
          code: "CANCELLED",
          message: "Payment was cancelled. Your bag is still saved.",
        };
  }

  onState("verifying");
  try {
    const confirmed = await confirmPayment({
      data: {
        razorpayOrderId: outcome.response.razorpay_order_id,
        razorpayPaymentId: outcome.response.razorpay_payment_id,
        razorpaySignature: outcome.response.razorpay_signature,
      },
    });
    if (!confirmed.ok) return { state: "failed", code: confirmed.code, message: confirmed.message };
    return { state: "success", order: confirmed.order };
  } catch {
    return {
      state: "failed",
      code: "VERIFY_NETWORK",
      message: `Your payment went through but we could not confirm it on this screen. Your order is recorded automatically — please keep payment ID ${outcome.response.razorpay_payment_id} and contact us if you do not hear from us.`,
    };
  }
}
