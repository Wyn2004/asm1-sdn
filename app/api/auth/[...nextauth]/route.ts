import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_EXPIRED = process.env.JWT_EXPIRED!;

export const authOption: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: +JWT_EXPIRED,
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password)
          throw new Error("Email hoặc mật khẩu không đúng");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Email hoặc mật khẩu không đúng");

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        await prisma.user.upsert({
          where: { email: profile.email },
          create: { email: profile.email, name: profile.name ?? "" },
          update: { name: profile.name ?? "" },
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
