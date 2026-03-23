import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getUser } from "@/app/lib/user";

export const { auth, signIn, signOut, handlers } = NextAuth({
      secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {},

      async authorize(credentials) {
        console.log("credentials:", credentials);
        const parsed = z.object({
          email: z.string().email(),
          password: z.string(),
        }).safeParse(credentials);

        if (!parsed.success) return null;
           
        const { email, password } = parsed.data;

        const user = await getUser(email);
        if (!user || !user.password_hash) return null;

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
});