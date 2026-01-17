import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileTabs from '@/components/profile/ProfileTabs'

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
      image: true,
      bio: true,
      website: true,
      location: true,
      coverImage: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          articles: true,
          bookmarks: true,
        }
      }
    }
  })

  return user
}

async function getUserArticles(userId: string) {
  const articles = await prisma.article.findMany({
    where: { authorId: userId },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      category: true,
      viewCount: true,
      publishedAt: true,
      _count: {
        select: {
          comments: true,
          bookmarks: true,
          votes: { where: { isHelpful: true } }
        }
      }
    }
  })

  return articles.map(article => ({
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    commentCount: article._count.comments,
    bookmarkCount: article._count.bookmarks,
    likeCount: article._count.votes,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    return {
      title: 'Kullanıcı Bulunamadı | HaberNexus'
    }
  }

  return {
    title: `${user.name || 'Kullanıcı'} (@${user.username || user.id}) | HaberNexus`,
    description: user.bio || `${user.name} kullanıcısının HaberNexus profili`,
    openGraph: {
      title: `${user.name || 'Kullanıcı'} | HaberNexus`,
      description: user.bio || `${user.name} kullanıcısının HaberNexus profili`,
      images: user.image ? [user.image] : [],
    }
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const [user, session] = await Promise.all([
    getUser(username),
    auth()
  ])

  if (!user) {
    notFound()
  }

  // Check if current user is following this user
  let isFollowing = false
  const isOwnProfile = session?.user?.id === user.id

  if (session?.user?.id && !isOwnProfile) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id
        }
      }
    })
    isFollowing = !!followRecord
  }

  // Get user's articles
  const articles = await getUserArticles(user.id)

  const profileData = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    followerCount: user._count.followers,
    followingCount: user._count.following,
    articleCount: user._count.articles,
    isFollowing,
    isOwnProfile,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ProfileHeader user={profileData} />
        
        <div className="mt-6">
          <ProfileTabs
            userId={user.id}
            username={user.username}
            initialArticles={articles}
            articleCount={user._count.articles}
            bookmarkCount={user._count.bookmarks}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </div>
  )
}
