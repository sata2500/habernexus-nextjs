import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Auth.js v5 Configuration (Edge-compatible)
 * This file contains the base configuration that can be used in Edge environments (middleware)
 * The adapter is NOT included here because Prisma is not Edge-compatible
 * 
 * @see https://authjs.dev/getting-started/providers/google
 */

// Validate required environment variables
const validateEnv = () => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}. Using fallback values for development.`)
  }
}

validateEnv()

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || 'test-client-secret',
      allowDangerousEmailAccountLinking: true,
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
