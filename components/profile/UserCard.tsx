'use client'

import Image from 'next/image'
import Link from 'next/link'
import FollowButton from './FollowButton'

interface UserCardProps {
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
    followerCount: number
    followingCount: number
  }
  isFollowing?: boolean
  showFollowButton?: boolean
  currentUserId?: string
}

export default function UserCard({ 
  user, 
  isFollowing = false, 
  showFollowButton = true,
  currentUserId 
}: UserCardProps) {
  const isOwnProfile = currentUserId === user.id

  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Avatar */}
      <Link href={`/profil/${user.username || user.id}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'Kullanıcı'}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-lg font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </Link>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/profil/${user.username || user.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {user.name || 'İsimsiz Kullanıcı'}
          </h3>
          {user.username && (
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          )}
        </Link>
        {user.bio && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{user.bio}</p>
        )}
        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span><strong className="text-gray-900 dark:text-white">{user.followerCount}</strong> Takipçi</span>
          <span><strong className="text-gray-900 dark:text-white">{user.followingCount}</strong> Takip</span>
        </div>
      </div>

      {/* Follow Button */}
      {showFollowButton && !isOwnProfile && (
        <FollowButton
          userId={user.id}
          initialIsFollowing={isFollowing}
          size="sm"
        />
      )}
    </div>
  )
}
