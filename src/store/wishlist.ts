import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "@/services/analytics";

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const active = get().ids.includes(id);
        trackEvent(active ? "wishlist_remove" : "wishlist_add", { id });
        set((state) => ({
          ids: active ? state.ids.filter((x) => x !== id) : [...state.ids, id],
        }));
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "ppa-wishlist", partialize: (state) => ({ ids: state.ids }) },
  ),
);
