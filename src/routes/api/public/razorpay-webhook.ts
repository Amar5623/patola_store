import { createFileRoute } from "@tanstack/react-router";
import { ConfigError, getRazorpayConfig, getWebhookSecret } from "@/server/env.server";
import { buildPaidRecord, recordPaidOrder } from "@/server/orders.server";
import {
  verifyWebhookSignature,
  type RazorpayOrder,
  type RazorpayPayment,
} from "@/server/razorpay.server";

/**
 * Razorpay webhook: POST /api/public/razorpay-webhook
 *
 * Subscribe to the `order.paid` event in Dashboard → Settings → Webhooks.
 * It is the safety net for payments where the shopper closed the tab before
 * the browser confirmation ran. Razorpay retries non-2xx responses for 24h,
 * and the sheet de-duplicates on Payment ID, so retries are harmless.
 */

const MAX_BODY_BYTES = 64 * 1024;

interface WebhookEvent {
  event: string;
  payload?: {
    order?: { entity?: RazorpayOrder };
    payment?: { entity?: RazorpayPayment };
  };
}

const text = (body: string, status: number) =>
  new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-razorpay-signature");
        if (!signature) return text("missing signature", 400);

        const declaredLength = Number(request.headers.get("content-length") ?? 0);
        if (declaredLength > MAX_BODY_BYTES) return text("payload too large", 413);
        const rawBody = await request.text();
        if (rawBody.length > MAX_BODY_BYTES) return text("payload too large", 413);

        let config;
        let webhookSecret;
        try {
          config = getRazorpayConfig();
          webhookSecret = getWebhookSecret();
        } catch (error) {
          console.error(
            "[webhook] configuration:",
            error instanceof ConfigError ? error.message : error,
          );
          return text("not configured", 503);
        }

        // Verify against the exact raw bytes Razorpay signed — never re-serialised JSON.
        if (!(await verifyWebhookSignature({ rawBody, signature, webhookSecret }))) {
          console.warn("[webhook] rejected invalid signature");
          return text("invalid signature", 401);
        }

        let event: WebhookEvent;
        try {
          event = JSON.parse(rawBody) as WebhookEvent;
        } catch {
          return text("invalid json", 400);
        }

        if (event.event !== "order.paid") return text("ignored", 200);

        const order = event.payload?.order?.entity;
        const payment = event.payload?.payment?.entity;
        if (!order || !payment) return text("incomplete payload", 400);

        const record = buildPaidRecord(config, order, payment, "webhook");
        if (!record) {
          // Not an order created by this storefront (e.g. a payment link); acknowledge.
          console.warn(`[webhook] order ${order.id} has no storefront notes; skipped`);
          return text("ignored", 200);
        }

        try {
          await recordPaidOrder(record);
          return text("ok", 200);
        } catch (error) {
          console.error(
            "[webhook] sheet sync failed:",
            error instanceof Error ? error.message : error,
          );
          // Non-2xx makes Razorpay retry later.
          return text("retry", 500);
        }
      },
    },
  },
});
