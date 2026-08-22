"use client";
import Link from "next/link";
import { Eye, RotateCcw, Star } from "lucide-react";
import { useStore } from "@/stores/use-store";
export function OrderProductActions({
  id,
  slug,
  review,
}: {
  id: number;
  slug: string;
  review: boolean;
}) {
  const add = useStore((state) => state.add);
  return (
    <div className="order-product-actions">
      <Link href={`/product/${slug}`}>
        <Eye />
        View product
      </Link>
      <button type="button" onClick={() => add(id)}>
        <RotateCcw />
        Buy again
      </button>
      {review && (
        <Link href={`/product/${slug}?review=1#reviews`}>
          <Star />
          Write a review
        </Link>
      )}
    </div>
  );
}
