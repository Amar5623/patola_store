import { PRODUCTS, type Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { MAX_CART_LINES, MAX_ORDER_TOTAL, MAX_QUANTITY_PER_ITEM, shippingFor } from "@/lib/config";

/**
 * Single source of truth for order pricing.
 *
 * The browser uses this to display totals; the server re-runs it from the
 * hardcoded catalogue before creating a Razorpay order, so prices stored in
 * localStorage (or tampered with) are never trusted.
 */

export interface CartLineInput {
  slug: string;
  quantity: number;
}

export interface QuotedLine {
  slug: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderQuote {
  lines: QuotedLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export type QuoteError =
  | { code: "EMPTY_CART" }
  | { code: "TOO_MANY_LINES" }
  | { code: "UNKNOWN_PRODUCT"; slug: string }
  | { code: "SOLD_OUT"; name: string }
  | { code: "INVALID_QUANTITY"; name: string }
  | { code: "ORDER_TOO_LARGE" };

const BY_SLUG = new Map<string, Product>(PRODUCTS.map((p) => [p.slug, p]));

export const findProduct = (slug: string) => BY_SLUG.get(slug);

export function quoteCart(
  input: CartLineInput[],
): { ok: true; quote: OrderQuote } | { ok: false; error: QuoteError } {
  if (input.length === 0) return { ok: false, error: { code: "EMPTY_CART" } };
  if (input.length > MAX_CART_LINES) return { ok: false, error: { code: "TOO_MANY_LINES" } };

  const merged = new Map<string, number>();
  for (const line of input) merged.set(line.slug, (merged.get(line.slug) ?? 0) + line.quantity);

  const lines: QuotedLine[] = [];
  for (const [slug, quantity] of merged) {
    const product = BY_SLUG.get(slug);
    if (!product) return { ok: false, error: { code: "UNKNOWN_PRODUCT", slug } };
    if (product.availability === "sold_out") {
      return { ok: false, error: { code: "SOLD_OUT", name: product.name } };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { ok: false, error: { code: "INVALID_QUANTITY", name: product.name } };
    }
    lines.push({
      slug,
      sku: product.sku,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = shippingFor(subtotal);
  const discount = 0;
  const total = Math.max(subtotal + shipping - discount, 0);
  if (total > MAX_ORDER_TOTAL) return { ok: false, error: { code: "ORDER_TOO_LARGE" } };
  return {
    ok: true,
    quote: {
      lines,
      subtotal,
      shipping,
      discount,
      total,
    },
  };
}

export function describeQuoteError(error: QuoteError) {
  switch (error.code) {
    case "EMPTY_CART":
      return "Your bag is empty.";
    case "TOO_MANY_LINES":
      return `A single order can hold up to ${MAX_CART_LINES} different pieces. Please contact the concierge for larger orders.`;
    case "UNKNOWN_PRODUCT":
      return "A piece in your bag is no longer listed. Please remove it and try again.";
    case "SOLD_OUT":
      return `${error.name} has just been reserved. Please remove it from your bag to continue.`;
    case "INVALID_QUANTITY":
      return `You can order up to ${MAX_QUANTITY_PER_ITEM} of ${error.name} online. For more, please contact us on WhatsApp.`;
    case "ORDER_TOO_LARGE":
      return `Online payments are limited to ${formatINR(MAX_ORDER_TOTAL)} per order. Please split your order or contact our concierge on WhatsApp to complete it.`;
  }
}
