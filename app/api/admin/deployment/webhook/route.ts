import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * GET /api/admin/deployment/webhook
 * Gets the webhook server status
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to connect to webhook server
    const webhookPort = process.env.WEBHOOK_PORT || 9000
    
    try {
      const response = await fetch(`http://localhost:${webhookPort}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          connected: true,
          data,
        })
      } else {
        return NextResponse.json({
          success: true,
          connected: false,
          error: 'Webhook server returned non-OK status',
        })
      }
    } catch {
      return NextResponse.json({
        success: true,
        connected: false,
        error: 'Could not connect to webhook server',
      })
    }
  } catch (error) {
    console.error('Webhook status error:', error)
    return NextResponse.json(
      { error: 'Failed to get webhook status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/deployment/webhook
 * Sends commands to the webhook server
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const webhookPort = process.env.WEBHOOK_PORT || 9000

    switch (action) {
      case 'reload-settings':
        try {
          const response = await fetch(`http://localhost:${webhookPort}/settings/reload`, {
            method: 'PUT',
            signal: AbortSignal.timeout(5000),
          })
          
          if (response.ok) {
            const data = await response.json()
            return NextResponse.json({
              success: true,
              message: 'Settings reloaded on webhook server',
              data,
            })
          } else {
            return NextResponse.json({
              success: false,
              error: 'Failed to reload settings on webhook server',
            })
          }
        } catch {
          return NextResponse.json({
            success: false,
            error: 'Could not connect to webhook server',
          })
        }

      case 'health-check':
        try {
          const response = await fetch(`http://localhost:${webhookPort}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
          })
          
          if (response.ok) {
            const data = await response.json()
            return NextResponse.json({
              success: true,
              healthy: true,
              data,
            })
          } else {
            return NextResponse.json({
              success: true,
              healthy: false,
            })
          }
        } catch {
          return NextResponse.json({
            success: true,
            healthy: false,
            error: 'Webhook server not responding',
          })
        }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Webhook command error:', error)
    return NextResponse.json(
      { error: 'Failed to execute webhook command' },
      { status: 500 }
    )
  }
}
