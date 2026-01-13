import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getImageSettings, saveImageSettings, DEFAULT_IMAGE_SETTINGS } from '@/lib/image-optimizer'

/**
 * GET /api/admin/image-settings
 * Get image optimization settings and statistics
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current settings
    const settings = await getImageSettings()

    // Get additional settings from SystemSetting
    const [enableImageGen, enableRssOpt, imageModel] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'enable_image_generation' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_rss_image_optimization' } }),
      prisma.systemSetting.findUnique({ where: { key: 'ai_model_image' } }),
    ])

    // Get image statistics
    const [aiGenerated, rssOptimized, placeholder] = await Promise.all([
      prisma.article.count({ where: { imageSource: 'ai' } }),
      prisma.article.count({ where: { imageSource: 'rss' } }),
      prisma.article.count({ where: { OR: [{ imageSource: 'placeholder' }, { imageSource: null }] } }),
    ])

    return NextResponse.json({
      settings: {
        ...settings,
        enableImageGeneration: enableImageGen?.value !== 'false',
        enableRssImageOptimization: enableRssOpt?.value !== 'false',
        imageModel: imageModel?.value || 'imagen-3.0-generate-002',
      },
      stats: {
        aiGenerated,
        rssOptimized,
        placeholder,
      },
    })
  } catch (error) {
    console.error('Get image settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/image-settings
 * Update image optimization settings
 */
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate settings
    const maxWidth = Math.min(Math.max(body.maxWidth || DEFAULT_IMAGE_SETTINGS.maxWidth, 400), 2400)
    const maxHeight = Math.min(Math.max(body.maxHeight || DEFAULT_IMAGE_SETTINGS.maxHeight, 200), 1350)
    const quality = Math.min(Math.max(body.quality || DEFAULT_IMAGE_SETTINGS.quality, 50), 100)
    const format = ['webp', 'avif', 'jpeg', 'png'].includes(body.format) 
      ? body.format 
      : DEFAULT_IMAGE_SETTINGS.format
    const stripMetadata = body.stripMetadata !== false

    // Save image optimization settings
    await saveImageSettings({
      maxWidth,
      maxHeight,
      quality,
      format,
      stripMetadata,
    })

    // Save system settings
    const systemSettings = [
      { key: 'enable_image_generation', value: String(body.enableImageGeneration !== false) },
      { key: 'enable_rss_image_optimization', value: String(body.enableRssImageOptimization !== false) },
      { key: 'ai_model_image', value: body.imageModel || 'imagen-3.0-generate-002' },
    ]

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update image settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
