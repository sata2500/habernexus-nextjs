import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Auth.js v5 Configuration (Edge-compatible)
 * This file contains the base configuration that can be used in Edge environments (middleware)
 * The adapter is NOT included here because Prisma is not Edge-compatible
 */
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      
      if (isOnAdmin) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
  },
} satisfies NextAuthConfig
