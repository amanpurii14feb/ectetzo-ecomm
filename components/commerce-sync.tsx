"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/stores/use-store";

export function CommerceSync() {
  const { data: session, status } = useSession();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const accountId = useStore((state) => state.accountId);
  const ready = useStore((state) => state.commerceReady);
  const syncing = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    const userId = session?.user?.id ?? null;
    if (!userId) {
      useStore.setState({ accountId: null, commerceReady: true });
      return;
    }
    if (accountId === userId && ready) return;
    let cancelled = false;
    void (async () => {
      await useStore.persist.rehydrate();
      const guest = useStore.getState();
      const response = await fetch("/api/commerce", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: guest.cart, wishlist: guest.wishlist, merge: true }),
      });
      if (!response.ok || cancelled) return;
      const data = await response.json();
      syncing.current = true;
      useStore.setState({ cart: data.cart, wishlist: data.wishlist, accountId: userId, commerceReady: true, hydrated: true });
      useStore.persist.clearStorage();
      queueMicrotask(() => { syncing.current = false; });
    })();
    return () => { cancelled = true; };
  }, [accountId, ready, session?.user?.id, status]);

  useEffect(() => {
    if (!accountId || !ready || syncing.current) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/commerce", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, wishlist, merge: false }),
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [accountId, cart, ready, wishlist]);

  return null;
}
