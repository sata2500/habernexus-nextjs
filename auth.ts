import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"
import type { Role } from "@prisma/client"
import type { JWT } from "next-auth/jwt"

/**
 * Auth.js v5 Main Configuration
 * This file includes the Prisma adapter and exports auth functions
 * Use this file everywhere except middleware (which uses auth.config.ts)
 */

// Custom JWT type with role
interface CustomJWT extends JWT {
  id?: string
  role?: Role
}

// Extend the session type to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>,
  session: { strategy: "jwt" }, // Use JWT for Edge compatibility
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }): Promise<CustomJWT> {
      // Add role to JWT token on first sign in
      if (user) {
        token.id = user.id
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = dbUser?.role ?? "USER"
      }
      return token as CustomJWT
    },
    async session({ session, token }) {
      // Add role to session from JWT token
      if (session.user) {
        session.user.id = (token as CustomJWT).id as string
        session.user.role = ((token as CustomJWT).role as Role) ?? "USER"
      }
      return session
    },
  },
})
