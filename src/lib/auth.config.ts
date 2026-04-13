import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/types/enums";

export const authConfig = {
  providers: [
    // We leave this empty here because the actual authorize function 
    // depends on bcrypt and prisma (Node.js). 
    // In v5, we will add the full provider in the Node-version (auth.ts).
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize will be overwritten in auth.ts
      async authorize() {
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  // Let Auth.js handle cookies automatically for dev/prod
} satisfies NextAuthConfig;
