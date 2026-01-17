import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[username]/following
 * Get users that a specific user is following
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

    // Get following
    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          createdAt: true,
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
      }),
      prisma.follow.count({
        where: { followerId: user.id }
      })
    ])

    return NextResponse.json({
      users: following.map(f => ({
        ...f.following,
        followedAt: f.createdAt,
        followerCount: f.following._count.followers,
        followingCount: f.following._count.following,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: 'Takip edilenler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
