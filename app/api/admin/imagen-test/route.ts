import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateImage, testImageGeneration, isImageGenerationConfigured } from '@/lib/image-generator'

/**
 * Unified Image Generation Test API
 * 
 * GET /api/admin/imagen-test
 * Test image generation API connection and configuration
 * 
 * POST /api/admin/imagen-test
 * Generate a test image with custom parameters
 * 
 * @version 2.0.0
 * @lastUpdated 20 January 2026
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

    // Check if image generation is configured
    const configured = await isImageGenerationConfigured()
    
    if (!configured) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'GEMINI_API_KEY is not configured',
        message: 'Please set the GEMINI_API_KEY environment variable',
      })
    }

    // Test the connection
    const testResult = await testImageGeneration()

    return NextResponse.json({
      success: testResult.success,
      configured: true,
      provider: testResult.provider,
      model: testResult.model,
      error: testResult.error,
      message: testResult.success 
        ? `Image generation API is working correctly (${testResult.provider}/${testResult.model})` 
        : `Image generation test failed: ${testResult.error}`,
    })
  } catch (error) {
    console.error('Image generation test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test image generation API',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, category, model } = body

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    console.log(`[ImageGen Test] Generating test image for: ${title} (${category})`)

    // Generate a test image using unified image generator
    const result = await generateImage(
      title,
      category,
      model ? { model } : undefined
    )

    return NextResponse.json({
      success: result.success,
      imageUrl: result.imageUrl,
      provider: result.provider,
      model: result.model,
      duration: result.duration,
      error: result.error,
      retryCount: result.retryCount,
      message: result.success 
        ? `Image generated successfully via ${result.provider}/${result.model}` 
        : `Image generation failed: ${result.error}`,
    })
  } catch (error) {
    console.error('Image generation test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to generate test image',
      },
      { status: 500 }
    )
  }
}
