import type { RazorpayConfig } from "./env.server";
import { getSheetConfig } from "./env.server";
import { decodeOrderNotes } from "./order-notes.server";
import type { RazorpayOrder, RazorpayPayment } from "./razorpay.server";
import { appendOrderToSheet, type PaidOrderRecord } from "./sheets.server";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly, unguessable order reference, e.g. PPA-261002-K7Q2M9XA. */
export function newOrderRef(now = new Date()) {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const random = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const date = ist.toISOString().slice(2, 10).replace(/-/g, "");
  return `PPA-${date}-${random}`;
}

export function buildPaidRecord(
  config: RazorpayConfig,
  order: RazorpayOrder,
  payment: RazorpayPayment,
  source: PaidOrderRecord["source"],
): PaidOrderRecord | null {
  const decoded = decodeOrderNotes(order.notes, payment.amount);
  if (!decoded) return null;
  return {
    orderRef: order.receipt ?? order.id,
    razorpayOrderId: order.id,
    paymentId: payment.id,
    paymentStatus: payment.status,
    paymentMethod: payment.method,
    environment: config.environment,
    paidAt: new Date(payment.created_at * 1000),
    order: decoded,
    source,
  };
}

/**
 * Write a verified payment to the order sheet. Safe to call more than once per
 * payment: the Apps Script de-duplicates on Payment ID.
 */
export async function recordPaidOrder(record: PaidOrderRecord) {
  const sheet = getSheetConfig();
  if (!sheet) {
    console.warn(
      `[orders] GOOGLE_SCRIPT_URL not configured; ${record.orderRef} not logged to sheet`,
    );
    return { logged: false as const };
  }
  const result = await appendOrderToSheet(sheet, record);
  console.info(
    `[orders] ${record.orderRef} ${record.paymentId} via ${record.source}${result.duplicate ? " (already logged)" : ""}`,
  );
  return { logged: true as const, duplicate: result.duplicate };
}
