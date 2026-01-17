'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = 'md',
  className
}: FollowButtonProps) {
  const { data: session, status } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (status !== 'authenticated') {
      // Redirect to login
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch('/api/follow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const newFollowState = !isFollowing
        setIsFollowing(newFollowState)
        onFollowChange?.(newFollowState)
      } else {
        const data = await response.json()
        console.error('Follow error:', data.error)
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if viewing own profile
  if (session?.user?.id === userId) {
    return null
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50',
        sizeClasses[size],
        isFollowing
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
          : 'bg-blue-600 text-white hover:bg-blue-700',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Takibi Bırak</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Takip Et</span>
        </>
      )}
    </button>
  )
}
