import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  getSchedulerStatus, 
  updateScheduler, 
  triggerContentGeneration,
  cronToHumanReadable 
} from '@/lib/scheduler'

/**
 * GET /api/admin/scheduler
 * Get scheduler status
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const status = getSchedulerStatus()
    
    return NextResponse.json({
      ...status,
      scheduleDescription: cronToHumanReadable(status.currentSchedule),
    })
  } catch (error) {
    console.error('Scheduler status error:', error)
    return NextResponse.json(
      { error: 'Zamanlayıcı durumu alınamadı' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/scheduler
 * Control scheduler (start, stop, restart, trigger)
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'restart':
        await updateScheduler()
        return NextResponse.json({ 
          success: true, 
          message: 'Zamanlayıcı yeniden başlatıldı' 
        })

      case 'trigger':
        const result = await triggerContentGeneration()
        return NextResponse.json(result)

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Scheduler control error:', error)
    return NextResponse.json(
      { error: 'Zamanlayıcı işlemi başarısız' },
      { status: 500 }
    )
  }
}
