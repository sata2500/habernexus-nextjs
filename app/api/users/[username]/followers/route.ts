import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[username]/followers
 * Get followers of a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Find user by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { id: username }
        ]
      },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Get followers
    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          createdAt: true,
          follower: {
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
      }),
      prisma.follow.count({
        where: { followingId: user.id }
      })
    ])

    return NextResponse.json({
      users: followers.map(f => ({
        ...f.follower,
        followedAt: f.createdAt,
        followerCount: f.follower._count.followers,
        followingCount: f.follower._count.following,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching followers:', error)
    return NextResponse.json(
      { error: 'Takipçiler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
