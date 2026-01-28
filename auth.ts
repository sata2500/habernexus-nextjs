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
 * 
 * Features:
 * - JWT-based sessions for Edge compatibility
 * - Automatic ADMIN role assignment for first user
 * - Role-based access control
 * - Google OAuth integration
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

/**
 * Check if this is the first user in the system
 * If so, they should be assigned ADMIN role automatically
 */
async function checkAndAssignFirstUserAdmin(userId: string): Promise<Role> {
  try {
    // Count total users in the system
    const userCount = await prisma.user.count()
    
    // If this is the first user (count is 1, meaning only this user exists)
    if (userCount === 1) {
      // Update the user to ADMIN role
      await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      })
      console.log(`✅ First user ${userId} assigned ADMIN role`)
      return "ADMIN"
    }
    
    // Otherwise, fetch the current role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    
    return dbUser?.role ?? "USER"
  } catch (error) {
    console.error("❌ Error checking/assigning first user admin:", error)
    return "USER"
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
        // Check if first user and assign ADMIN role if so
        token.role = await checkAndAssignFirstUserAdmin(user.id as string)
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
