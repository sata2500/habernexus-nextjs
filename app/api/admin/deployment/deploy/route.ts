import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { execSync } from 'child_process'
import path from 'path'

/**
 * POST /api/admin/deployment/deploy
 * Triggers a manual deployment to a specific version
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetVersion, type = 'manual' } = body

    if (!targetVersion) {
      return NextResponse.json(
        { error: 'Target version is required' },
        { status: 400 }
      )
    }

    // Get current version
    let currentVersion = 'unknown'
    try {
      currentVersion = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    } catch {
      // Ignore
    }

    // Check if there's already a deployment in progress
    const runningDeployment = await prisma.deploymentHistory.findFirst({
      where: { status: 'running' },
    })

    if (runningDeployment) {
      return NextResponse.json(
        { error: 'A deployment is already in progress' },
        { status: 409 }
      )
    }

    // Create deployment record
    const deployment = await prisma.deploymentHistory.create({
      data: {
        type,
        status: 'pending',
        fromVersion: currentVersion.substring(0, 8),
        toVersion: targetVersion,
        triggeredBy: session.user.email || session.user.name || 'admin',
      },
    })

    // Start deployment in background
    startDeployment(deployment.id, targetVersion, type)

    return NextResponse.json({
      success: true,
      message: 'Deployment started',
      data: {
        deploymentId: deployment.id,
        targetVersion,
        type,
      },
    })
  } catch (error) {
    console.error('Deploy error:', error)
    return NextResponse.json(
      { error: 'Failed to start deployment' },
      { status: 500 }
    )
  }
}

/**
 * Start deployment process in background
 */
async function startDeployment(deploymentId: string, targetVersion: string, type: string) {
  const logs: string[] = []
  const startTime = Date.now()

  try {
    // Update status to running
    await prisma.deploymentHistory.update({
      where: { id: deploymentId },
      data: { status: 'running' },
    })

    logs.push(`[${new Date().toISOString()}] Deployment started`)
    logs.push(`[${new Date().toISOString()}] Target version: ${targetVersion}`)
    logs.push(`[${new Date().toISOString()}] Type: ${type}`)

    // Get install directory from environment or use default
    const installDir = process.env.INSTALL_DIR || process.cwd()
    
    // Check if we should create backup
    const backupSetting = await prisma.deploymentSettings.findUnique({
      where: { key: 'backup_before_deploy' },
    })
    
    if (backupSetting?.value !== 'false') {
      logs.push(`[${new Date().toISOString()}] Creating backup...`)
      try {
        // Simple backup of critical files
        const backupDir = path.join(installDir, 'backups', `deploy-${Date.now()}`)
        execSync(`mkdir -p ${backupDir}`, { cwd: installDir })
        
        // Backup database if exists
        try {
          execSync(`cp data.db ${backupDir}/ 2>/dev/null || true`, { cwd: installDir })
          logs.push(`[${new Date().toISOString()}] Database backed up`)
        } catch {
          logs.push(`[${new Date().toISOString()}] No database to backup`)
        }
        
        // Backup .env if exists
        try {
          execSync(`cp .env ${backupDir}/ 2>/dev/null || true`, { cwd: installDir })
          logs.push(`[${new Date().toISOString()}] Environment file backed up`)
        } catch {
          logs.push(`[${new Date().toISOString()}] No .env to backup`)
        }
      } catch (error) {
        logs.push(`[${new Date().toISOString()}] Backup warning: ${error}`)
      }
    }

    // Fetch latest from remote
    logs.push(`[${new Date().toISOString()}] Fetching from remote...`)
    execSync('git fetch --all --tags', { cwd: installDir, encoding: 'utf-8' })
    logs.push(`[${new Date().toISOString()}] Fetch completed`)

    // Stash any local changes
    try {
      const status = execSync('git status --porcelain', { cwd: installDir, encoding: 'utf-8' })
      if (status.trim()) {
        logs.push(`[${new Date().toISOString()}] Stashing local changes...`)
        execSync(`git stash push -m "Auto-stash before deploy ${Date.now()}"`, { cwd: installDir })
      }
    } catch {
      // Ignore stash errors
    }

    // Checkout target version
    logs.push(`[${new Date().toISOString()}] Checking out ${targetVersion}...`)
    execSync(`git checkout ${targetVersion}`, { cwd: installDir, encoding: 'utf-8' })
    logs.push(`[${new Date().toISOString()}] Checkout completed`)

    // If it's a branch, pull latest
    try {
      const isBranch = execSync(`git show-ref --verify refs/heads/${targetVersion} 2>/dev/null || echo ""`, { 
        cwd: installDir, 
        encoding: 'utf-8' 
      }).trim()
      
      if (isBranch) {
        logs.push(`[${new Date().toISOString()}] Pulling latest changes...`)
        execSync(`git pull origin ${targetVersion}`, { cwd: installDir, encoding: 'utf-8' })
      }
    } catch {
      // Not a branch, that's fine
    }

    // Install dependencies
    logs.push(`[${new Date().toISOString()}] Installing dependencies...`)
    execSync('npm ci --production=false', { cwd: installDir, encoding: 'utf-8', timeout: 300000 })
    logs.push(`[${new Date().toISOString()}] Dependencies installed`)

    // Generate Prisma client
    logs.push(`[${new Date().toISOString()}] Generating Prisma client...`)
    execSync('npx prisma generate', { cwd: installDir, encoding: 'utf-8' })
    logs.push(`[${new Date().toISOString()}] Prisma client generated`)

    // Push database changes
    logs.push(`[${new Date().toISOString()}] Updating database...`)
    execSync('npx prisma db push', { cwd: installDir, encoding: 'utf-8' })
    logs.push(`[${new Date().toISOString()}] Database updated`)

    // Build project
    logs.push(`[${new Date().toISOString()}] Building project...`)
    execSync('npm run build', { cwd: installDir, encoding: 'utf-8', timeout: 600000 })
    logs.push(`[${new Date().toISOString()}] Build completed`)

    // Restart application (if PM2 is available)
    try {
      logs.push(`[${new Date().toISOString()}] Restarting application...`)
      execSync('pm2 restart habernexus || true', { cwd: installDir, encoding: 'utf-8' })
      logs.push(`[${new Date().toISOString()}] Application restarted`)
    } catch {
      logs.push(`[${new Date().toISOString()}] PM2 restart skipped (not in production)`)
    }

    const duration = Math.round((Date.now() - startTime) / 1000)
    logs.push(`[${new Date().toISOString()}] Deployment completed successfully in ${duration}s`)

    // Update deployment record
    await prisma.deploymentHistory.update({
      where: { id: deploymentId },
      data: {
        status: 'success',
        completedAt: new Date(),
        duration,
        logs: JSON.stringify(logs),
      },
    })
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logs.push(`[${new Date().toISOString()}] ERROR: ${errorMessage}`)
    logs.push(`[${new Date().toISOString()}] Deployment failed after ${duration}s`)

    // Update deployment record with error
    await prisma.deploymentHistory.update({
      where: { id: deploymentId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        duration,
        logs: JSON.stringify(logs),
        errorMessage,
      },
    })
  }
}
