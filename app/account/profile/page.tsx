import { AccountShell } from "@/components/account-shell";
import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export default async function Page() {
  const session=await auth();
  const user=await prisma.user.findUniqueOrThrow({where:{id:session!.user!.id!},select:{name:true,email:true,phone:true}});
  return (
    <AccountShell>
      <div>
        <h1 className="section-title">Profile</h1>
        <ProfileForm initial={{name:user.name??"",email:user.email,phone:user.phone??""}}/>
      </div>
    </AccountShell>
  );
}
