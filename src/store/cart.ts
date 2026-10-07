import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_CART_LINES, MAX_QUANTITY_PER_ITEM, shippingFor } from "@/lib/config";
import type { Product } from "@/data/products";
import { findProduct } from "@/lib/pricing";
import { trackEvent } from "@/services/analytics";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  technique: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      addToCart: (product, quantity = 1) => {
        if (product.availability === "sold_out") return;
        trackEvent("add_to_cart", { sku: product.sku, price: product.price, quantity });
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (!existing && state.items.length >= MAX_CART_LINES) return { drawerOpen: true };
          const items = existing
            ? state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY_PER_ITEM) }
                  : i,
              )
            : [
                ...state.items,
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  image: product.images[0]!,
                  technique: product.technique,
                  quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY_PER_ITEM),
                },
              ];
          return { items, drawerOpen: true };
        });
      },
      removeFromCart: (id) => {
        trackEvent("remove_from_cart", { id });
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY_PER_ITEM) } : i,
          ),
        })),
      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
    }),
    {
      name: "ppa-cart",
      partialize: (state) => ({ items: state.items }),
      // Re-sync persisted items with the catalogue: stale or edited prices are
      // replaced and delisted / reserved pieces are dropped.
      merge: (persisted, current) => ({
        ...current,
        items: reconcileItems((persisted as { items?: CartItem[] } | undefined)?.items ?? []),
      }),
    },
  ),
);

function reconcileItems(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .flatMap((item) => {
      const product = item && typeof item.slug === "string" ? findProduct(item.slug) : undefined;
      if (!product || product.availability === "sold_out") return [];
      const quantity = Number.isInteger(item.quantity)
        ? Math.min(Math.max(item.quantity, 1), MAX_QUANTITY_PER_ITEM)
        : 1;
      return [
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.images[0]!,
          technique: product.technique,
          quantity,
        },
      ];
    })
    .slice(0, MAX_CART_LINES);
}

export function cartTotals(items: CartItem[], discount = 0) {
  const subtotal = items.reduce(
    (sum, i) => sum + (findProduct(i.slug)?.price ?? i.price) * i.quantity,
    0,
  );
  const shipping = shippingFor(subtotal);
  const grandTotal = Math.max(subtotal + shipping - discount, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, shipping, discount, grandTotal, count };
}
