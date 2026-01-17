'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Link as LinkIcon, Calendar, Settings } from 'lucide-react'
import FollowButton from './FollowButton'

interface ProfileHeaderProps {
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
    website: string | null
    location: string | null
    coverImage: string | null
    role: string
    createdAt: string
    followerCount: number
    followingCount: number
    articleCount: number
    isFollowing: boolean
    isOwnProfile: boolean
  }
  onFollowChange?: (isFollowing: boolean) => void
}

export default function ProfileHeader({ user, onFollowChange }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {user.coverImage && (
          <Image
            src={user.coverImage}
            alt="Kapak fotoğrafı"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 sm:-mt-20 mb-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Kullanıcı'}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-3xl sm:text-4xl font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Name and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {user.name || 'İsimsiz Kullanıcı'}
            </h1>
            {user.username && (
              <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
            )}
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
              {user.role}
            </span>
          </div>

          <div className="flex gap-2">
            {user.isOwnProfile ? (
              <Link
                href="/profil/duzenle"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Profili Düzenle</span>
              </Link>
            ) : (
              <FollowButton
                userId={user.id}
                initialIsFollowing={user.isFollowing}
                onFollowChange={onFollowChange}
              />
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{user.bio}</p>
        )}

        {/* Meta Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <a
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{user.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(user.createdAt)} tarihinde katıldı</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6">
          <Link
            href={`/profil/${user.username || user.id}/takipciler`}
            className="hover:underline"
          >
            <span className="font-bold text-gray-900 dark:text-white">{user.followerCount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">Takipçi</span>
          </Link>
          <Link
            href={`/profil/${user.username || user.id}/takip-edilenler`}
            className="hover:underline"
          >
            <span className="font-bold text-gray-900 dark:text-white">{user.followingCount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">Takip</span>
          </Link>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{user.articleCount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">Makale</span>
          </div>
        </div>
      </div>
    </div>
  )
}
