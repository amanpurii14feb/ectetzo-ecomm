"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
type State = {
  cart: Record<number, number>;
  couponCode: string;
  wishlist: number[];
  hydrated: boolean;
  accountId: string | null;
  commerceReady: boolean;
  add: (id: number, q?: number) => void;
  remove: (id: number) => void;
  quantity: (id: number, q: number) => void;
  clearCart: () => void;
  setCouponCode: (code: string) => void;
  resetCommerce: () => void;
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
      couponCode: "",
      wishlist: [],
      hydrated: false,
      accountId: null,
      commerceReady: false,
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
      clearCart: () =>
        set({ cart: {}, couponCode: "", notice: "Order placed successfully" }),
      setCouponCode: (couponCode) => set({ couponCode }),
      resetCommerce: () =>
        set({ cart: {}, couponCode: "", wishlist: [], notice: "" }),
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
      // Authenticated account data lives only in PostgreSQL, never localStorage.
      partialize: (s) =>
        s.accountId
          ? { cart: {}, couponCode: "", wishlist: [] }
          : { cart: s.cart, couponCode: s.couponCode, wishlist: s.wishlist },
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Clears both in-memory state and the browser-persisted basket. */
export function clearCommerceData() {
  useStore.getState().resetCommerce();
  useStore.setState({ accountId: null, commerceReady: false, hydrated: true });
  useStore.persist.clearStorage();
}
