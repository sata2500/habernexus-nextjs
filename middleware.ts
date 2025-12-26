import NextAuth from "next-auth"
import authConfig from "./auth.config"

/**
 * Auth.js v5 Middleware
 * Protects routes based on authentication status
 * Uses auth.config.ts (Edge-compatible, no Prisma)
 */
const { auth } = NextAuth(authConfig)

export default auth

// Configure which routes to protect
export const config = {
  matcher: [
    // Protect admin routes
    "/admin/:path*",
    // Protect API routes (except auth)
    "/api/((?!auth).)*",
  ],
}
