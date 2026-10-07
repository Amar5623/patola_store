import type { CustomerDetails } from "@/lib/checkout-schema";

export type { CustomerDetails };

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  items: Array<{ sku: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentId?: string | undefined;
  /** demo = simulated in the browser; test / live = Razorpay environment. */
  mode: "demo" | "test" | "live";
}

/**
 * Order record service (browser side).
 *
 * The system of record is the owner's Google Sheet, written server-side after
 * the Razorpay signature is verified (src/server/orders.server.ts). The browser
 * only keeps the latest confirmed order in sessionStorage — scoped to this tab,
 * cleared when it closes — so the confirmation page can render it. Customer
 * details are never persisted long-term on the device.
 */

const STORAGE_KEY = "ppa-last-order";

export function rememberOrder(record: OrderRecord) {
  if (typeof window === "undefined") return record;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    // Remove the legacy long-lived store from earlier builds.
    window.localStorage.removeItem("ppa-orders");
  } catch {
    // Storage can be unavailable (private mode); the confirmation page then
    // falls back to the reference-only view.
  }
  return record;
}

export function getOrder(orderId: string): OrderRecord | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const record = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) ?? "null",
    ) as OrderRecord | null;
    return record?.orderId === orderId ? record : undefined;
  } catch {
    return undefined;
  }
}
