import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

/**
 * POST /api/follow
 * Follow a user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Can't follow yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinizi takip edemezsiniz' },
        { status: 400 }
      )
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Bu kullanıcıyı zaten takip ediyorsunuz' },
        { status: 400 }
      )
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId
      }
    })

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId: userId,
        actorId: session.user.id,
        type: 'FOLLOW',
        message: `${session.user.name || 'Bir kullanıcı'} sizi takip etmeye başladı`,
        link: `/profil/${session.user.id}`
      }
    })

    return NextResponse.json({
      success: true,
      follow
    })
  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json(
      { error: 'Takip işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/follow
 * Unfollow a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Bu kullanıcıyı takip etmiyorsunuz' },
        { status: 400 }
      )
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: 'Takibi bırakma işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/follow
 * Check if current user is following a specific user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    return NextResponse.json({
      isFollowing: !!follow
    })
  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json(
      { error: 'Takip durumu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
