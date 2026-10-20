/**
 * Central brand + commerce configuration.
 * Never hardcode these values in components.
 */

export const APP_MODE = (import.meta.env["VITE_APP_MODE"] ?? "demo") as "demo" | "production";

export const BRAND = {
  name: "Pragati Patola Art",
  tagline: "The Art of Patan",
  secondary: "Woven once. Treasured forever.",
  supporting: "Where Silk Meets Precision.",
  phoneDisplay: "+91 98987 16280",
  phoneDial: "+919898716280",
  whatsapp: "919898716280",
  email: "chetan@pragatipatolaart.in",
  address: {
    line1: "Rashvi Residency",
    line2: "Rajkot Bypass Road",
    line3: "Ganpati Fatsar",
    city: "Wadhwan - 363030",
    state: "Gujarat, India",
  },
  social: {
    instagram: import.meta.env["VITE_INSTAGRAM_URL"] ?? "https://instagram.com",
    facebook: import.meta.env["VITE_FACEBOOK_URL"] ?? "https://facebook.com",
  },
} as const;

export const FREE_SHIPPING_THRESHOLD = 100000;
/** Handwoven pieces are near one-of-a-kind; cap per-line quantity and distinct lines per order. */
export const MAX_QUANTITY_PER_ITEM = 3;
export const MAX_CART_LINES = 10;
/**
 * Largest single online payment accepted. Keep this at or below the
 * per-transaction limit Razorpay assigns the account (check Dashboard →
 * Account & Settings, or ask Razorpay support). Larger orders go to the concierge.
 */
export const MAX_ORDER_TOTAL = 40000;
export const STANDARD_SHIPPING_COST = 1500;

export const SHIPPING_COPY = {
  domestic: "Insured dispatch across India, 3–6 working days.",
  free: "Complimentary insured shipping on orders above ₹1,00,000.",
} as const;

export function shippingFor(subtotal: number) {
  // TEMP live payment test: carts of ₹200 or less ship free. Remove after the test.
  if (subtotal <= 200) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_COST;
}

export function freeShippingProgress(subtotal: number) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  return { remaining, progress, unlocked: remaining === 0 };
}
