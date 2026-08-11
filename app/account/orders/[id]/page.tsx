import { AccountShell } from "@/components/account-shell";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { auth } from "@/auth";import { prisma } from "@/lib/prisma";import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session=await auth();const order=await prisma.order.findFirst({where:{userId:session!.user!.id!,OR:[{id},{orderNumber:id}]},include:{items:true}});if(!order)notFound();
  return (
    <AccountShell>
      <div>
        <div className="eyebrow">Order #{order.orderNumber}</div>
        <h1 className="section-title mt-2">Order details</h1>
        <div className="card mt-7 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><b>Status: {order.status}</b><span>{order.createdAt.toLocaleString("en-IN")}</span></div>
          <div className="my-6 space-y-3 border-y py-5">{order.items.map(i=><div className="flex justify-between gap-4" key={i.id}><span>{i.name} × {i.quantity}</span><b>₹{(i.price*i.quantity).toLocaleString("en-IN")}</b></div>)}</div>
          <div className="flex justify-between text-xl"><b>Total</b><b>₹{order.total.toLocaleString("en-IN")}</b></div>
          <p className="mt-5 muted">Shipping to {order.shippingName}, {order.addressLine1}, {order.city}, {order.state} {order.pin}</p>
          {["PENDING","CONFIRMED"].includes(order.status)&&<CancelOrderButton id={order.id}/>} 
        </div>
      </div>
    </AccountShell>
  );
}
