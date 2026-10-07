import { PRODUCTS } from "@/data/products";
import type { CustomerDetails } from "@/lib/checkout-schema";
import type { OrderQuote } from "@/lib/pricing";
import type { RazorpayNotes } from "./razorpay.server";

/**
 * No-database order storage: the full order (customer + priced lines) is
 * written into the Razorpay order's `notes` when it is created. Both the
 * browser confirmation and the webhook read it back from Razorpay, so the
 * order survives even if the shopper closes the tab after paying.
 *
 * Razorpay limits: at most 15 note keys, each value at most 256 characters.
 * Field lengths are bounded by `customerSchema` and `MAX_CART_LINES`.
 */

const VERSION = "1";
const MAX_NOTE = 256;

export interface DecodedOrder {
  customer: CustomerDetails;
  items: Array<{ sku: string; name: string; unitPrice: number; quantity: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const clip = (value: string) => value.slice(0, MAX_NOTE);

export function encodeOrderNotes(customer: CustomerDetails, quote: OrderQuote): RazorpayNotes {
  // "SKU*qty*unitPrice" per line, e.g. PPA-DI-001*1*112000 (≤ 20 chars × 10 lines).
  const items = quote.lines.map((l) => `${l.sku}*${l.quantity}*${l.unitPrice}`).join(";");
  if (items.length > MAX_NOTE) throw new Error("Order has too many lines to encode");

  return {
    v: VERSION,
    name: clip(customer.fullName),
    email: clip(customer.email),
    phone: clip(customer.phone),
    whatsapp: clip(customer.whatsapp),
    wa_consent: customer.whatsappConsent ? "yes" : "no",
    address: clip(customer.address),
    apartment: clip(customer.apartment ?? ""),
    city: clip(customer.city),
    state: clip(customer.state),
    postal: clip(customer.postalCode),
    country: clip(customer.country),
    amounts: `${quote.subtotal}*${quote.shipping}*${quote.discount}`,
    items,
  };
}

const SKU_NAMES = new Map(PRODUCTS.map((p) => [p.sku, p.name]));

export function decodeOrderNotes(notes: unknown, totalPaise: number): DecodedOrder | null {
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return null;
  const n = notes as Record<string, unknown>;
  const s = (key: string) => (typeof n[key] === "string" ? (n[key] as string) : "");
  if (s("v") !== VERSION) return null;

  const items = s("items")
    .split(";")
    .filter(Boolean)
    .map((part) => {
      const [sku = "", qty = "0", price = "0"] = part.split("*");
      return {
        sku,
        name: SKU_NAMES.get(sku) ?? sku,
        quantity: Number(qty) || 0,
        unitPrice: Number(price) || 0,
      };
    });
  const [subtotal = 0, shipping = 0, discount = 0] = s("amounts").split("*").map(Number);

  return {
    customer: {
      fullName: s("name"),
      email: s("email"),
      phone: s("phone"),
      whatsapp: s("whatsapp"),
      whatsappConsent: s("wa_consent") === "yes",
      address: s("address"),
      apartment: s("apartment") || undefined,
      city: s("city"),
      state: s("state"),
      postalCode: s("postal"),
      country: s("country"),
    },
    items,
    subtotal,
    shipping,
    discount,
    total: totalPaise / 100,
  };
}
