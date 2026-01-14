import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  getRecentErrors, 
  getImageStatsSummary, 
  getErrorsByType,
  resolveErrors,
  clearOldErrors 
} from '@/lib/image-error-tracker'

/**
 * GET /api/admin/image-errors
 * Get image errors and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const [errors, stats, errorsByType] = await Promise.all([
      getRecentErrors(limit),
      getImageStatsSummary(),
      getErrorsByType(),
    ])

    return NextResponse.json({
      errors: errors.errors,
      totalErrors: errors.total,
      stats,
      errorsByType,
    })
  } catch (error) {
    console.error('Get image errors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/image-errors
 * Resolve errors or perform cleanup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, errorIds, daysOld } = body

    if (action === 'resolve' && errorIds && Array.isArray(errorIds)) {
      const count = await resolveErrors(errorIds)
      return NextResponse.json({
        success: true,
        message: `${count} error(s) resolved`,
        count,
      })
    }

    if (action === 'cleanup') {
      const count = await clearOldErrors(daysOld || 30)
      return NextResponse.json({
        success: true,
        message: `${count} old error(s) cleared`,
        count,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Image errors action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
