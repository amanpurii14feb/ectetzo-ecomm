import { prisma } from "@/lib/prisma"; import { ProductsTable } from "@/admin/components/products-table";
export const dynamic="force-dynamic";
export default async function Page(){const products=await prisma.product.findMany({orderBy:{updatedAt:"desc"}});return <ProductsTable initial={products.map(p=>({...p,updatedAt:p.updatedAt.toISOString()}))}/>}
