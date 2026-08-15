import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
type C = { params: Promise<{ slug: string[] }> };
const schema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(120),
  status: z.string().trim().min(1).max(40).default("Active"),
  data: z.record(z.string().min(1).max(80), z.union([z.string().max(5000), z.number().finite(), z.boolean(), z.null()])).refine(value => Object.keys(value).length <= 50, "Too many fields.").default({}),
}).strict();
export async function GET(_r: Request, { params }: C) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params,
    moduleKey = slug.join("/");
  return NextResponse.json({
    items: await prisma.adminRecord.findMany({
      where: { module: moduleKey },
      orderBy: { updatedAt: "desc" },
    }),
  });
}
export async function POST(request: Request, { params }: C) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid item." },
      { status: 400 },
    );
  const { slug } = await params,
    moduleKey = slug.join("/"),
    { id, ...values } = parsed.data,
    data = { ...values, data: values.data as Prisma.InputJsonObject },
    item = id
      ? await prisma.adminRecord.update({ where: { id, module: moduleKey }, data })
      : await prisma.adminRecord.create({ data: { module: moduleKey, ...data } });
  return NextResponse.json({ item }, { status: id ? 200 : 201 });
}
export async function DELETE(request: Request, { params }: C) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params,
    moduleKey = slug.join("/"),
    body = await request.json().catch(() => null),
    id = body?.id;
  if (typeof id !== "string")
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  await prisma.adminRecord.delete({ where: { id, module: moduleKey } });
  return NextResponse.json({ deleted: true });
}
