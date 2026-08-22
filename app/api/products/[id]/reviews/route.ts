import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional().default(""),
  comment: z.string().trim().min(10).max(1200),
});

async function findProduct(id: string) {
  const legacyId = Number(id);
  if (!Number.isInteger(legacyId)) return null;
  return prisma.product.findUnique({ where: { legacyId } });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const userId = await currentUserId();
  const [reviews, deliveredPurchase, ownReview] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, rating: true, title: true, comment: true, createdAt: true,
        user: { select: { name: true } },
      },
    }),
    userId ? prisma.orderItem.findFirst({
      where: { productId: product.id, order: { userId, status: "DELIVERED" } },
      select: { id: true },
    }) : null,
    userId ? prisma.productReview.findUnique({
      where: { userId_productId: { userId, productId: product.id } },
      select: { rating: true, title: true, comment: true },
    }) : null,
  ]);

  return NextResponse.json({
    rating: product.rating,
    count: product.reviews,
    canReview: Boolean(deliveredPurchase),
    signedIn: Boolean(userId),
    ownReview,
    reviews: reviews.map((review) => ({
      ...review,
      reviewer: review.user.name?.trim() || "Verified customer",
      verified: true,
      user: undefined,
    })),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in to review this product" }, { status: 401 });

  const { id } = await params;
  const product = await findProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const purchased = await prisma.orderItem.findFirst({
    where: { productId: product.id, order: { userId, status: "DELIVERED" } },
    select: { id: true },
  });
  if (!purchased) return NextResponse.json({ error: "Reviews are available after a delivered purchase" }, { status: 403 });

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid review" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.productReview.upsert({
      where: { userId_productId: { userId, productId: product.id } },
      create: { userId, productId: product.id, ...parsed.data },
      update: parsed.data,
    });
    const aggregate = await tx.productReview.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await tx.product.update({
      where: { id: product.id },
      data: { rating: aggregate._avg.rating ?? 0, reviews: aggregate._count.rating },
    });
  });

  return NextResponse.json({ ok: true });
}
