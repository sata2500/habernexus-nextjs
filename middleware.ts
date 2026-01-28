import NextAuth from "next-auth"
import authConfig from "./auth.config"

/**
 * Auth.js v5 Middleware (Proxy Pattern)
 * Protects routes based on authentication status
 * Uses auth.config.ts (Edge-compatible, no Prisma)
 * 
 * @see https://nextjs.org/docs/app/building-your-application/authentication
 */
const { auth } = NextAuth(authConfig)

// Export auth middleware as default
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
