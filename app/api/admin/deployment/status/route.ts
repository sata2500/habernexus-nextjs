import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { execSync } from 'child_process'

/**
 * GET /api/admin/deployment/status
 * Returns current deployment status including:
 * - Current version (git commit/tag)
 * - Last deployment info
 * - Webhook server status
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current git information
    let currentCommit = 'unknown'
    let currentBranch = 'unknown'
    let currentTag = null
    let lastCommitDate = null
    let lastCommitMessage = null

    try {
      currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
      currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
      
      // Try to get current tag
      try {
        currentTag = execSync('git describe --tags --exact-match 2>/dev/null', { encoding: 'utf-8' }).trim()
      } catch {
        // No tag at current commit
        currentTag = null
      }
      
      // Get last commit info
      lastCommitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim()
      lastCommitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
    } catch (error) {
      console.error('Git info error:', error)
    }

    // Get last deployment from database
    const lastDeployment = await prisma.deploymentHistory.findFirst({
      orderBy: { startedAt: 'desc' },
    })

    // Get deployment settings
    const settings = await prisma.deploymentSettings.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })

    // Check webhook server status (if running locally)
    let webhookStatus = 'unknown'
    try {
      const response = await fetch('http://localhost:9000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        webhookStatus = data.status === 'ok' ? 'running' : 'error'
      }
    } catch {
      webhookStatus = 'not_running'
    }

    return NextResponse.json({
      success: true,
      data: {
        currentVersion: {
          commit: currentCommit,
          shortCommit: currentCommit.substring(0, 8),
          branch: currentBranch,
          tag: currentTag,
          lastCommitDate,
          lastCommitMessage,
        },
        lastDeployment: lastDeployment ? {
          id: lastDeployment.id,
          type: lastDeployment.type,
          status: lastDeployment.status,
          fromVersion: lastDeployment.fromVersion,
          toVersion: lastDeployment.toVersion,
          triggeredBy: lastDeployment.triggeredBy,
          startedAt: lastDeployment.startedAt,
          completedAt: lastDeployment.completedAt,
          duration: lastDeployment.duration,
        } : null,
        webhookStatus,
        settings: {
          webhookEnabled: settingsMap['webhook_enabled'] === 'true',
          cooldownPeriod: parseInt(settingsMap['cooldown_period'] || '60'),
          allowedBranches: settingsMap['allowed_branches'] || 'master,main',
          autoDeployEnabled: settingsMap['auto_deploy_enabled'] !== 'false',
        },
      },
    })
  } catch (error) {
    console.error('Deployment status error:', error)
    return NextResponse.json(
      { error: 'Failed to get deployment status' },
      { status: 500 }
    )
  }
}
