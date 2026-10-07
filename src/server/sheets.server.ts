import { BRAND } from "@/lib/config";
import { formatINR } from "@/lib/format";
import type { DecodedOrder } from "./order-notes.server";
import type { SheetConfig } from "./env.server";

/**
 * Google Sheet order log (no database).
 *
 * Rows are POSTed to a Google Apps Script web app bound to the owner's sheet
 * (see integrations/google-apps-script/Code.gs). The script authenticates the
 * shared secret, de-duplicates on "Payment ID" (the browser confirmation and
 * the Razorpay webhook both report every payment) and neutralises spreadsheet
 * formula injection.
 */

export interface PaidOrderRecord {
  orderRef: string;
  razorpayOrderId: string;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string;
  environment: "test" | "live";
  paidAt: Date;
  order: DecodedOrder;
  source: "checkout" | "webhook";
}

/** wa.me needs the full international number as digits only. */
export function toWhatsAppNumber(raw: string, country: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^india$/i.test(country.trim()) || country.trim() === "") {
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) digits = `91${digits}`;
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : "";
}

/**
 * The fixed, personalised order-confirmation message the store owner sends
 * from the sheet. Edit the wording here; keep it under ~600 characters so the
 * encoded wa.me link stays well inside URL limits.
 */
export function buildWhatsAppConfirmation(record: PaidOrderRecord) {
  const { order } = record;
  const firstName = order.customer.fullName.split(/\s+/)[0] ?? order.customer.fullName;
  return [
    `Namaste ${firstName},`,
    "",
    `Thank you for choosing ${BRAND.name}. Your order ${record.orderRef} is confirmed.`,
    "",
    ...order.items.map((i) => `• ${i.name} × ${i.quantity}`),
    "",
    `Total paid: ${formatINR(order.total)}`,
    `Payment ID: ${record.paymentId}`,
    `Delivering to: ${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}`,
    "",
    "Your piece will be documented, packed and sent by insured dispatch within 3–6 working days. We will share tracking details here.",
    "",
    "Kindly record an unboxing video when the parcel arrives.",
    "",
    `— ${BRAND.name}`,
    BRAND.phoneDisplay,
  ].join("\n");
}

function istTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function buildSheetRow(record: PaidOrderRecord): Record<string, string | number> {
  const { order } = record;
  const c = order.customer;
  const waNumber = toWhatsAppNumber(c.whatsapp || c.phone, c.country);
  const message = buildWhatsAppConfirmation(record);
  const waLink =
    c.whatsappConsent && waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
      : "";

  return {
    "Order Date (IST)": istTimestamp(record.paidAt),
    "Order Ref": record.orderRef,
    "Payment Status": record.paymentStatus,
    "Payment ID": record.paymentId,
    "Razorpay Order ID": record.razorpayOrderId,
    "Payment Method": record.paymentMethod,
    Mode: record.environment,
    "Customer Name": c.fullName,
    Email: c.email,
    Phone: c.phone,
    WhatsApp: c.whatsapp,
    "WhatsApp Consent": c.whatsappConsent ? "Yes" : "No",
    Address: c.address,
    Apartment: c.apartment ?? "",
    City: c.city,
    State: c.state,
    "Postal Code": c.postalCode,
    Country: c.country,
    Items: order.items
      .map((i) => `${i.name} (${i.sku}) × ${i.quantity} @ ${formatINR(i.unitPrice)}`)
      .join("\n"),
    "Item Count": order.items.reduce((sum, i) => sum + i.quantity, 0),
    "Subtotal (INR)": order.subtotal,
    "Shipping (INR)": order.shipping,
    "Discount (INR)": order.discount,
    "Total Paid (INR)": order.total,
    "WhatsApp Message": message,
    "WhatsApp Link":
      waLink ||
      (c.whatsappConsent ? "Invalid number — call customer" : "No consent — use phone/email"),
    "Fulfilment Status": "New",
    "Recorded Via": record.source,
  };
}

export async function appendOrderToSheet(config: SheetConfig, record: PaidOrderRecord) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    // Apps Script answers POST with a 302 to script.googleusercontent.com;
    // fetch follows it (as GET) and returns the script's JSON output.
    const response = await fetch(config.url, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret: config.secret,
        sheet: record.environment === "live" ? "Orders" : "Test Orders",
        dedupeColumn: "Payment ID",
        row: buildSheetRow(record),
      }),
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    let result: { ok?: boolean; duplicate?: boolean; error?: string } = {};
    try {
      result = JSON.parse(text) as typeof result;
    } catch {
      throw new Error(`Sheet sync returned non-JSON (HTTP ${response.status})`);
    }
    if (!response.ok || !result.ok) {
      throw new Error(`Sheet sync failed: ${result.error ?? `HTTP ${response.status}`}`);
    }
    return { duplicate: Boolean(result.duplicate) };
  } finally {
    clearTimeout(timeout);
  }
}
