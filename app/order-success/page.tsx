import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <div className="container section text-center">
      <CheckCircle2 className="mx-auto text-green-600" size={72} />
      <div className="eyebrow mt-6">Order confirmed</div>
      <h1 className="section-title mt-2">Thank you for your order!</h1>
      <p className="mx-auto mt-4 max-w-lg muted">
        Your order {order ?? ""} has been placed. A confirmation and tracking updates
        will be sent to your email.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link className="btn btn-dark" href="/account/orders">
          Track order
        </Link>
        <Link className="btn btn-outline" href="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
