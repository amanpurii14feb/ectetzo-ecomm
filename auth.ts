import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().trim().min(6).max(100),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          if (process.env.NODE_ENV === "development") console.warn("[auth] Credentials rejected: invalid input shape");
          return null;
        }
        const user = await prisma.user.findFirst({
          where: { email: { equals: parsed.data.email, mode: "insensitive" } },
        });
        if (!user?.passwordHash) {
          if (process.env.NODE_ENV === "development") console.warn("[auth] Credentials rejected: account or password hash missing");
          return null;
        }
        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          if (process.env.NODE_ENV === "development") console.warn("[auth] Credentials rejected: password mismatch");
          return null;
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = (token.id ?? token.sub) as string;
      return session;
    },
  },
});
