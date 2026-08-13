import { AccountShell } from "@/components/account-shell";
import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRound } from "lucide-react";
export default async function Page() {
  const session=await auth();
  const user=await prisma.user.findUniqueOrThrow({where:{id:session!.user!.id!},select:{name:true,email:true,phone:true}});
  return (
    <AccountShell>
      <div className="profile-page">
        <div className="profile-heading">
          <h1><UserRound /> Profile</h1>
          <p>Update your personal information and account details.</p>
        </div>
        <div className="profile-layout">
          <ProfileForm initial={{name:user.name??"",email:user.email,phone:user.phone??""}}/>
          <div className="profile-art" aria-hidden="true">
            <span className="spark spark-one">✦</span><span className="spark spark-two">✦</span>
            <div className="clipboard"><i className="clip"/><div className="avatar"><UserRound/></div><b/><b/><b/><b/></div>
            <span className="pencil" />
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
