import { ModulePage } from "@/admin/components/module-page";
import { fallbackModule, modules } from "@/admin/services/modules";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params,
    path = slug.join("/"),
    items = await prisma.adminRecord.findMany({
      where: { module: path },
      orderBy: { updatedAt: "desc" },
    });
  return (
    <ModulePage
      module={modules[path] ?? fallbackModule(path)}
      moduleKey={path}
      initial={items.map((item) => ({
        ...item,
        data: item.data as Record<string, unknown>,
        updatedAt: item.updatedAt.toISOString(),
      }))}
    />
  );
}
