import type { OrderStatus, Prisma } from "@prisma/client";

export async function updateOrderStatus(tx: Prisma.TransactionClient, id: string, status: OrderStatus) {
  const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return null;
  if (order.status === "CANCELLED" && status !== "CANCELLED") throw new Error("Cancelled orders cannot be reopened.");
  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    if (order.status === "DELIVERED") throw new Error("Delivered orders cannot be cancelled.");
    for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
  }
  return tx.order.update({ where: { id }, data: { status } });
}
