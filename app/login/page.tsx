import { AuthForm } from "@/components/auth-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/account";
  const session = await auth();
  if (session?.user) redirect(destination);
  return <AuthForm callbackUrl={destination} />;
}
