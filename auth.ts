import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import authConfig from "./auth.config"
import jwt from "jsonwebtoken"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id
      }
      
      const signingSecret = process.env.SUPABASE_JWT_SECRET
      if (signingSecret && token.sub) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: token.sub,
          email: token.email,
          role: "authenticated",
        }
        session.supabaseAccessToken = jwt.sign(payload, signingSecret)
      }
      return session
    },
  },
  ...authConfig,
})