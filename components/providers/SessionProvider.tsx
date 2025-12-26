"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

/**
 * Session Provider Wrapper
 * Wraps the application with NextAuth SessionProvider for client-side session access
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
