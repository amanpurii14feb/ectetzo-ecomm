import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";
import { z } from "zod";
const schema=z.object({label:z.string().trim().min(2).max(20),name:z.string().trim().min(2).max(80),phone:z.string().regex(/^\d{10}$/),line1:z.string().trim().min(8).max(200),city:z.string().trim().min(2).max(80),state:z.string().trim().min(2).max(80),pin:z.string().regex(/^\d{6}$/),isDefault:z.boolean()});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const userId=await currentUserId(); if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:"Invalid address."},{status:400});
  const {id}=await params;
  const address=await prisma.$transaction(async tx=>{const found=await tx.address.findFirst({where:{id,userId}});if(!found)return null;if(parsed.data.isDefault)await tx.address.updateMany({where:{userId},data:{isDefault:false}});return tx.address.update({where:{id},data:parsed.data});});
  if(!address)return NextResponse.json({error:"Address not found."},{status:404}); return NextResponse.json({address});
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await prisma.address.deleteMany({ where: { id, userId } });
  if (!result.count) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
