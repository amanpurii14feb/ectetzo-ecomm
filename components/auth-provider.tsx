"use client";

import { SessionProvider } from "next-auth/react";
import { CommerceSync } from "@/components/commerce-sync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <CommerceSync />
      {children}
    </SessionProvider>
  );
}
