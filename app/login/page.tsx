import { AuthForm } from "@/components/auth-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (session?.user) redirect("/account");
  return <AuthForm />;
}
