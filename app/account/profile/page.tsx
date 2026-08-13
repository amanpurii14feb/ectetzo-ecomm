import { AccountShell } from "@/components/account-shell";
import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRound } from "lucide-react";
export default async function Page() {
  const session=await auth();
  const user=await prisma.user.findUniqueOrThrow({where:{id:session!.user!.id!},select:{id:true,name:true,email:true,phone:true,createdAt:true}});
  return (
    <AccountShell>
      <div className="profile-page">
        <div className="profile-heading">
          <h1><UserRound /> Profile</h1>
          <p>Update your personal information and account details.</p>
        </div>
        <section className="profile-hero card"><span>{user.name?.[0]?.toUpperCase()??"E"}</span><div><h2>{user.name}</h2><p>{user.email} · {user.phone?`+91 ${user.phone}`:"Add mobile number"}</p><em>✓ Verified customer</em></div><div className="profile-progress"><b>Profile completion <strong>{user.phone?"85%":"65%"}</strong></b><i><span style={{width:user.phone?"85%":"65%"}}/></i><small>Member since {user.createdAt.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</small></div></section>
        <div className="profile-layout">
          <ProfileForm initial={{name:user.name??"",email:user.email,phone:user.phone??""}}/>
          <aside className="account-info-card card"><h2>Account information</h2><dl><div><dt>Customer ID</dt><dd>#{user.id.slice(-8).toUpperCase()}</dd></div><div><dt>Account created</dt><dd>{user.createdAt.toLocaleDateString("en-IN")}</dd></div><div><dt>Last login</dt><dd>Current session</dd></div><div><dt>Account status</dt><dd><em>Active</em></dd></div></dl><h2>Communication</h2><label><span>Email notifications<small>Orders and account updates</small></span><input type="checkbox" defaultChecked/></label><label><span>SMS notifications<small>Delivery alerts</small></span><input type="checkbox" defaultChecked/></label></aside>
        </div>
      </div>
    </AccountShell>
  );
}
