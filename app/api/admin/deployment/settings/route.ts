import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Default settings
const DEFAULT_SETTINGS = {
  webhook_enabled: 'true',
  auto_deploy_enabled: 'true',
  cooldown_period: '60',
  allowed_branches: 'master,main',
  webhook_secret: '',
  notify_on_deploy: 'true',
  backup_before_deploy: 'true',
}

/**
 * GET /api/admin/deployment/settings
 * Returns deployment settings
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all settings from database
    const settings = await prisma.deploymentSettings.findMany()
    
    // Create settings map with defaults
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json({
      success: true,
      data: {
        webhookEnabled: settingsMap.webhook_enabled === 'true',
        autoDeployEnabled: settingsMap.auto_deploy_enabled === 'true',
        cooldownPeriod: parseInt(settingsMap.cooldown_period),
        allowedBranches: settingsMap.allowed_branches.split(',').map(b => b.trim()),
        webhookSecretConfigured: !!settingsMap.webhook_secret,
        notifyOnDeploy: settingsMap.notify_on_deploy === 'true',
        backupBeforeDeploy: settingsMap.backup_before_deploy === 'true',
      },
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/deployment/settings
 * Updates deployment settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      webhookEnabled,
      autoDeployEnabled,
      cooldownPeriod,
      allowedBranches,
      webhookSecret,
      notifyOnDeploy,
      backupBeforeDeploy,
    } = body

    // Prepare settings to update
    const settingsToUpdate: { key: string; value: string; description?: string }[] = []

    if (typeof webhookEnabled === 'boolean') {
      settingsToUpdate.push({
        key: 'webhook_enabled',
        value: webhookEnabled.toString(),
        description: 'Whether webhook server accepts incoming requests',
      })
    }

    if (typeof autoDeployEnabled === 'boolean') {
      settingsToUpdate.push({
        key: 'auto_deploy_enabled',
        value: autoDeployEnabled.toString(),
        description: 'Whether auto-deployment is enabled on push events',
      })
    }

    if (typeof cooldownPeriod === 'number' && cooldownPeriod >= 0) {
      settingsToUpdate.push({
        key: 'cooldown_period',
        value: cooldownPeriod.toString(),
        description: 'Cooldown period between deployments in seconds',
      })
    }

    if (Array.isArray(allowedBranches)) {
      settingsToUpdate.push({
        key: 'allowed_branches',
        value: allowedBranches.join(','),
        description: 'Comma-separated list of branches that trigger deployment',
      })
    }

    if (typeof webhookSecret === 'string') {
      settingsToUpdate.push({
        key: 'webhook_secret',
        value: webhookSecret,
        description: 'Secret for webhook signature verification',
      })
    }

    if (typeof notifyOnDeploy === 'boolean') {
      settingsToUpdate.push({
        key: 'notify_on_deploy',
        value: notifyOnDeploy.toString(),
        description: 'Whether to send notifications on deployment',
      })
    }

    if (typeof backupBeforeDeploy === 'boolean') {
      settingsToUpdate.push({
        key: 'backup_before_deploy',
        value: backupBeforeDeploy.toString(),
        description: 'Whether to create backup before deployment',
      })
    }

    // Update settings in database
    for (const setting of settingsToUpdate) {
      await prisma.deploymentSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: setting,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      updatedCount: settingsToUpdate.length,
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
