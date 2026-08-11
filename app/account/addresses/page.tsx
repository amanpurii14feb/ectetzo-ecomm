import { AccountShell } from "@/components/account-shell";
import { AddressManager } from "@/components/address-manager";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export default async function Page() {
  const session=await auth();
  const addresses=await prisma.address.findMany({where:{userId:session!.user!.id!},orderBy:[{isDefault:"desc"},{createdAt:"desc"}]});
  return (
    <AccountShell>
      <div>
        <h1 className="section-title">Addresses</h1>
        <div className="mt-7"><AddressManager initial={addresses.map(({id,label,name,phone,line1,city,state,pin,isDefault})=>({id,label,name,phone,line1,city,state,pin,isDefault}))}/></div>
      </div>
    </AccountShell>
  );
}
