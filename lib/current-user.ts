import { auth } from "@/auth";

export async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
