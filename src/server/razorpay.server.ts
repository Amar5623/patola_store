import type { RazorpayConfig } from "./env.server";

/**
 * Minimal Razorpay REST client built on fetch + Web Crypto so it runs on
 * Cloudflare Workers (and any other Web-standard runtime) without the
 * Node-only `razorpay` SDK.
 *
 * Docs: https://razorpay.com/docs/api/orders/ and
 * https://razorpay.com/docs/payments/server-integration/
 */

const API_BASE = "https://api.razorpay.com/v1";

export type RazorpayNotes = Record<string, string>;

export interface RazorpayOrder {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: "created" | "attempted" | "paid";
  notes: RazorpayNotes | unknown[];
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string | null;
  method: string;
  email?: string;
  contact?: string;
  captured: boolean;
  created_at: number;
}

export class RazorpayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RazorpayApiError";
  }
}

async function request<T>(
  config: RazorpayConfig,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { description?: string; code?: string };
  };
  if (!response.ok) {
    // Never echo credentials; Razorpay error descriptions are safe to log.
    throw new RazorpayApiError(
      `Razorpay ${method} ${path} failed: ${payload.error?.code ?? response.status} ${payload.error?.description ?? ""}`.trim(),
      response.status,
    );
  }
  return payload as T;
}

export function createOrder(
  config: RazorpayConfig,
  input: { amountPaise: number; receipt: string; notes: RazorpayNotes },
) {
  return request<RazorpayOrder>(config, "POST", "/orders", {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}

export const fetchOrder = (config: RazorpayConfig, orderId: string) =>
  request<RazorpayOrder>(config, "GET", `/orders/${encodeURIComponent(orderId)}`);

export const fetchPayment = (config: RazorpayConfig, paymentId: string) =>
  request<RazorpayPayment>(config, "GET", `/payments/${encodeURIComponent(paymentId)}`);

/* ---------------------------- Signatures ---------------------------- */

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time comparison so signature checks don't leak timing. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export async function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}) {
  const expected = await hmacSha256Hex(input.keySecret, `${input.orderId}|${input.paymentId}`);
  return safeEqual(expected, input.signature.toLowerCase());
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook_secret). */
export async function verifyWebhookSignature(input: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}) {
  const expected = await hmacSha256Hex(input.webhookSecret, input.rawBody);
  return safeEqual(expected, input.signature.toLowerCase());
}
