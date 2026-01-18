import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/deployment/history
 * Returns deployment history with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'auto', 'manual', 'rollback'
    const status = searchParams.get('status') // 'pending', 'running', 'success', 'failed'

    // Build where clause
    const where: Record<string, string> = {}
    if (type) where.type = type
    if (status) where.status = status

    // Get total count
    const total = await prisma.deploymentHistory.count({ where })

    // Get deployments with pagination
    const deployments = await prisma.deploymentHistory.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Format deployments
    const formattedDeployments = deployments.map(d => ({
      id: d.id,
      type: d.type,
      status: d.status,
      fromVersion: d.fromVersion,
      toVersion: d.toVersion,
      triggeredBy: d.triggeredBy,
      startedAt: d.startedAt,
      completedAt: d.completedAt,
      duration: d.duration,
      errorMessage: d.errorMessage,
      hasLogs: !!d.logs,
    }))

    return NextResponse.json({
      success: true,
      data: {
        deployments: formattedDeployments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment history' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/deployment/history/[id]
 * Returns detailed deployment info including logs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deploymentId } = body

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      )
    }

    const deployment = await prisma.deploymentHistory.findUnique({
      where: { id: deploymentId },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    // Parse logs if available
    let logs: string[] = []
    if (deployment.logs) {
      try {
        logs = JSON.parse(deployment.logs)
      } catch {
        logs = [deployment.logs]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deployment.id,
        type: deployment.type,
        status: deployment.status,
        fromVersion: deployment.fromVersion,
        toVersion: deployment.toVersion,
        triggeredBy: deployment.triggeredBy,
        startedAt: deployment.startedAt,
        completedAt: deployment.completedAt,
        duration: deployment.duration,
        errorMessage: deployment.errorMessage,
        logs,
      },
    })
  } catch (error) {
    console.error('Deployment detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment details' },
      { status: 500 }
    )
  }
}
