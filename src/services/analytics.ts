import { APP_MODE } from "@/lib/config";

export type AnalyticsEvent =
  | "page_view"
  | "product_view"
  | "quick_view_open"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_view"
  | "cart_drawer_open"
  | "wishlist_add"
  | "wishlist_remove"
  | "whatsapp_click"
  | "checkout_start"
  | "checkout_step"
  | "payment_initiated"
  | "payment_success"
  | "payment_failed"
  | "payment_cancelled"
  | "enquiry_submitted"
  | "newsletter_signup"
  | "search";

/**
 * Analytics abstraction. In demo mode events are logged only.
 * A real provider can be attached here without touching components.
 */
export function trackEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (APP_MODE === "demo") {
    console.info(`[analytics] ${event}`, payload);
    return;
  }
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...payload });
}
