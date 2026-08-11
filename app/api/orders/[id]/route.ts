import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/order-status";
export async function PATCH(_:Request,{params}:{params:Promise<{id:string}>}){
 const userId=await currentUserId();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;
 const owned=await prisma.order.findFirst({where:{id,userId},select:{id:true,status:true}});if(!owned)return NextResponse.json({error:"Order not found"},{status:404});
 if(!["PENDING","CONFIRMED"].includes(owned.status))return NextResponse.json({error:"This order can no longer be cancelled."},{status:409});
 const order=await prisma.$transaction(tx=>updateOrderStatus(tx,id,"CANCELLED"));return NextResponse.json({order});
}
