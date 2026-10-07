import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cartLinesSchema, customerSchema } from "@/lib/checkout-schema";
import { describeQuoteError, quoteCart, type OrderQuote } from "@/lib/pricing";
import type { OrderRecord } from "@/services/orders";
import { ConfigError, getRazorpayConfig } from "@/server/env.server";
import { encodeOrderNotes } from "@/server/order-notes.server";
import { buildPaidRecord, newOrderRef, recordPaidOrder } from "@/server/orders.server";
import {
  createOrder,
  fetchOrder,
  fetchPayment,
  verifyCheckoutSignature,
} from "@/server/razorpay.server";

/**
 * Checkout server functions (RPC endpoints called from the browser).
 * Protected from cross-site calls by the CSRF middleware in src/start.ts.
 * Responses never include secrets or raw gateway errors.
 */

const GENERIC_FAILURE =
  "We could not reach the payment gateway. No money has been taken — please try again in a moment.";

type Failure = { ok: false; code: string; message: string };

const fail = (code: string, message: string): Failure => ({ ok: false, code, message });

function logServerError(scope: string, error: unknown) {
  if (error instanceof ConfigError) console.error(`[${scope}] configuration: ${error.message}`);
  else console.error(`[${scope}]`, error instanceof Error ? error.message : error);
}

/* ------------------------------ Create order ------------------------------ */

const createCheckoutInput = z.object({
  customer: customerSchema,
  lines: cartLinesSchema,
  /** Total the shopper saw, in rupees. Used only to detect stale carts. */
  expectedTotal: z.number().nonnegative(),
});

export type CreateCheckoutResult =
  | {
      ok: true;
      keyId: string;
      razorpayOrderId: string;
      orderRef: string;
      amountPaise: number;
      quote: OrderQuote;
      environment: "test" | "live";
    }
  | Failure;

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator(createCheckoutInput)
  .handler(async ({ data }): Promise<CreateCheckoutResult> => {
    const priced = quoteCart(data.lines);
    if (!priced.ok) return fail(priced.error.code, describeQuoteError(priced.error));
    const { quote } = priced;

    if (quote.total !== data.expectedTotal) {
      return fail(
        "PRICE_CHANGED",
        "Prices in your bag have been updated. Please review the new total and try again.",
      );
    }

    try {
      const config = getRazorpayConfig();
      const orderRef = newOrderRef();
      const order = await createOrder(config, {
        amountPaise: Math.round(quote.total * 100),
        receipt: orderRef,
        notes: encodeOrderNotes(data.customer, quote),
      });
      return {
        ok: true,
        keyId: config.keyId,
        razorpayOrderId: order.id,
        orderRef,
        amountPaise: order.amount,
        quote,
        environment: config.environment,
      };
    } catch (error) {
      logServerError("checkout.create", error);
      return fail("GATEWAY_UNAVAILABLE", GENERIC_FAILURE);
    }
  });

/* ----------------------------- Confirm payment ---------------------------- */

const confirmPaymentInput = z.object({
  razorpayOrderId: z.string().regex(/^order_[A-Za-z0-9]{6,40}$/),
  razorpayPaymentId: z.string().regex(/^pay_[A-Za-z0-9]{6,40}$/),
  razorpaySignature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export type ConfirmPaymentResult = { ok: true; order: OrderRecord } | Failure;

export const confirmPayment = createServerFn({ method: "POST" })
  .inputValidator(confirmPaymentInput)
  .handler(async ({ data }): Promise<ConfirmPaymentResult> => {
    let config;
    try {
      config = getRazorpayConfig();
    } catch (error) {
      logServerError("checkout.confirm", error);
      return fail("GATEWAY_UNAVAILABLE", GENERIC_FAILURE);
    }

    const signatureValid = await verifyCheckoutSignature({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
      keySecret: config.keySecret,
    });
    if (!signatureValid) {
      console.warn(`[checkout.confirm] invalid signature for ${data.razorpayOrderId}`);
      return fail(
        "INVALID_SIGNATURE",
        "We could not verify this payment. Please contact us with your payment ID.",
      );
    }

    try {
      // Re-read both entities from Razorpay: the browser only supplies IDs.
      const [order, payment] = await Promise.all([
        fetchOrder(config, data.razorpayOrderId),
        fetchPayment(config, data.razorpayPaymentId),
      ]);

      const paid =
        payment.order_id === order.id &&
        payment.amount === order.amount &&
        payment.currency === "INR" &&
        (payment.status === "captured" || payment.status === "authorized");
      if (!paid) {
        console.warn(`[checkout.confirm] payment ${payment.id} not settled: ${payment.status}`);
        return fail(
          "PAYMENT_NOT_COMPLETED",
          "Your payment was not completed. No order has been placed.",
        );
      }

      const record = buildPaidRecord(config, order, payment, "checkout");
      if (!record) {
        console.error(`[checkout.confirm] could not decode notes for ${order.id}`);
        return fail(
          "ORDER_UNREADABLE",
          "Payment received, but we could not load your order. Our team will contact you.",
        );
      }

      // A sheet failure must not fail a successful payment — the Razorpay
      // webhook delivers the same order again and retries for 24 hours.
      try {
        await recordPaidOrder(record);
      } catch (error) {
        logServerError("checkout.sheet", error);
      }

      return {
        ok: true,
        order: {
          orderId: record.orderRef,
          createdAt: record.paidAt.toISOString(),
          customer: record.order.customer,
          items: record.order.items.map((i) => ({
            sku: i.sku,
            name: i.name,
            price: i.unitPrice,
            quantity: i.quantity,
          })),
          subtotal: record.order.subtotal,
          shipping: record.order.shipping,
          discount: record.order.discount,
          total: record.order.total,
          paymentStatus: "paid",
          paymentId: record.paymentId,
          mode: record.environment,
        },
      };
    } catch (error) {
      logServerError("checkout.confirm", error);
      return fail(
        "VERIFICATION_UNAVAILABLE",
        `We could not confirm your payment just now. If money was debited, your order is safe — please contact us quoting ${data.razorpayPaymentId}.`,
      );
    }
  });
