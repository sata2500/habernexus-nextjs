import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import UserCard from '@/components/profile/UserCard'

interface PageProps {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { id: username }
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
    }
  })
  return user
}

async function getFollowing(userId: string, currentUserId?: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      }
    }
  })

  // Check if current user is following each user
  let followingStatus: Record<string, boolean> = {}
  if (currentUserId) {
    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: following.map(f => f.following.id) }
      },
      select: { followingId: true }
    })
    followingStatus = currentUserFollowing.reduce((acc, f) => {
      acc[f.followingId] = true
      return acc
    }, {} as Record<string, boolean>)
  }

  return following.map(f => ({
    ...f.following,
    followerCount: f.following._count.followers,
    followingCount: f.following._count.following,
    isFollowing: followingStatus[f.following.id] || false
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    return { title: 'Kullanıcı Bulunamadı | HaberNexus' }
  }

  return {
    title: `${user.name || 'Kullanıcı'} - Takip Edilenler | HaberNexus`,
    description: `${user.name} kullanıcısının takip ettikleri`
  }
}

export default async function FollowingPage({ params }: PageProps) {
  const { username } = await params
  const [user, session] = await Promise.all([
    getUser(username),
    auth()
  ])

  if (!user) {
    notFound()
  }

  const following = await getFollowing(user.id, session?.user?.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/profil/${user.username || user.id}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Profile Dön</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6" />
            Takip Edilenler
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user.name || 'Kullanıcı'} {following.length} kişiyi takip ediyor
          </p>
        </div>

        {/* Following List */}
        <div className="space-y-2">
          {following.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Henüz kimseyi takip etmiyor</p>
            </div>
          ) : (
            following.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={user.isFollowing}
                currentUserId={session?.user?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
