import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";
import { z } from "zod";
const schema=z.object({label:z.string().trim().min(2).max(20),name:z.string().trim().min(2).max(80),phone:z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number."),line1:z.string().trim().min(8).max(200),city:z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u),state:z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u),pin:z.string().regex(/^[1-9]\d{5}$/, "Enter a valid PIN code."),isDefault:z.boolean()}).strict();

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const userId=await currentUserId(); if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid address."},{status:400});
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
