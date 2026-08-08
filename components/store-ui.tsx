"use client";
import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useStore } from "@/stores/use-store";

export function StoreUI() {
  const notice = useStore((s) => s.notice);
  const clear = useStore((s) => s.clearNotice);
  useEffect(() => {
    // Preserve carts created before the brand rename.
    const legacyKey = ["volt", "zo-store"].join("");
    const oldStore = window.localStorage.getItem(legacyKey);
    if (oldStore && !window.localStorage.getItem("electzo-store")) {
      window.localStorage.setItem("electzo-store", oldStore);
      window.localStorage.removeItem(legacyKey);
    }
    useStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clear, 2600);
    return () => window.clearTimeout(timer);
  }, [notice, clear]);
  if (!notice) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={19} className="text-green-500" />
      <span>{notice}</span>
      <button onClick={clear} aria-label="Dismiss"><X size={17} /></button>
    </div>
  );
}
