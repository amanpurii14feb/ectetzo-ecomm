"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
type State = {
  cart: Record<number, number>;
  wishlist: number[];
  hydrated: boolean;
  add: (id: number, q?: number) => void;
  remove: (id: number) => void;
  quantity: (id: number, q: number) => void;
  clearCart: () => void;
  toggleWish: (id: number) => void;
  moveToWishlist: (id: number) => void;
  notice: string;
  notify: (message: string) => void;
  clearNotice: () => void;
  setHydrated: (hydrated: boolean) => void;
};
export const useStore = create<State>()(
  persist(
    (set) => ({
      cart: {},
      wishlist: [],
      hydrated: false,
      notice: "",
      add: (id, q = 1) =>
        set((s) => ({
          cart: { ...s.cart, [id]: (s.cart[id] || 0) + q },
          notice: "Added to cart",
        })),
      remove: (id) =>
        set((s) => {
          const c = { ...s.cart };
          delete c[id];
          return { cart: c, notice: "Removed from cart" };
        }),
      quantity: (id, q) =>
        set((s) => ({ cart: { ...s.cart, [id]: Math.max(1, q) } })),
      clearCart: () => set({ cart: {}, notice: "Order placed successfully" }),
      toggleWish: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((x) => x !== id)
            : [...s.wishlist, id],
          notice: s.wishlist.includes(id)
            ? "Removed from wishlist"
            : "Saved to wishlist",
        })),
      moveToWishlist: (id) =>
        set((s) => {
          const cart = { ...s.cart };
          delete cart[id];
          return {
            cart,
            wishlist: s.wishlist.includes(id)
              ? s.wishlist
              : [...s.wishlist, id],
            notice: "Moved to wishlist",
          };
        }),
      notify: (notice) => set({ notice }),
      clearNotice: () => set({ notice: "" }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "electzo-store",
      skipHydration: true,
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
