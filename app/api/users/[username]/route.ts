import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

/**
 * GET /api/users/[username]
 * Get user profile by username
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    // Try to find user by username first, then by id
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
            comments: true,
            bookmarks: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if current user is following this user
    const session = await auth()
    let isFollowing = false
    let isOwnProfile = false

    if (session?.user?.id) {
      isOwnProfile = session.user.id === user.id
      
      if (!isOwnProfile) {
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
    }

    return NextResponse.json({
      ...user,
      isFollowing,
      isOwnProfile,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      articleCount: user._count.articles,
      commentCount: user._count.comments,
      bookmarkCount: user._count.bookmarks,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Profil yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[username]
 * Update user profile (only own profile)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { username } = await params
    
    // Find the user to update
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { id: username }
        ]
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if user is updating their own profile
    if (targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Sadece kendi profilinizi düzenleyebilirsiniz' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, username: newUsername, bio, website, location, coverImage } = body

    // Validate username if provided
    if (newUsername) {
      // Check username format (alphanumeric, underscore, hyphen, 3-30 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
      if (!usernameRegex.test(newUsername)) {
        return NextResponse.json(
          { error: 'Kullanıcı adı 3-30 karakter olmalı ve sadece harf, rakam, alt çizgi ve tire içerebilir' },
          { status: 400 }
        )
      }

      // Check if username is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          username: newUsername,
          NOT: { id: targetUser.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        name: name || undefined,
        username: newUsername || undefined,
        bio: bio !== undefined ? bio : undefined,
        website: website !== undefined ? website : undefined,
        location: location !== undefined ? location : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
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
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
