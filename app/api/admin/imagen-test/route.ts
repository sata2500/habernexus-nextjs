import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateArticleImage, testImagenConnection, isImagenConfigured } from '@/lib/imagen'

/**
 * GET /api/admin/imagen-test
 * Test Imagen API connection and configuration
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

    // Check if Imagen is configured
    const configured = await isImagenConfigured()
    
    if (!configured) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'GEMINI_API_KEY is not configured',
        message: 'Please set the GEMINI_API_KEY environment variable',
      })
    }

    // Test the connection
    const testResult = await testImagenConnection()

    return NextResponse.json({
      success: testResult.success,
      configured: true,
      model: testResult.model,
      error: testResult.error,
      message: testResult.success 
        ? 'Imagen API is working correctly' 
        : `Imagen API test failed: ${testResult.error}`,
    })
  } catch (error) {
    console.error('Imagen test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test Imagen API',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/imagen-test
 * Generate a test image with custom parameters
 */
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

    console.log(`[Imagen Test] Generating test image for: ${title} (${category})`)

    // Generate a test image
    const result = await generateArticleImage(
      title,
      category,
      undefined,
      model
    )

    return NextResponse.json({
      success: result.success,
      imageUrl: result.imageUrl,
      error: result.error,
      retryCount: result.retryCount,
      message: result.success 
        ? `Image generated successfully: ${result.imageUrl}` 
        : `Image generation failed: ${result.error}`,
    })
  } catch (error) {
    console.error('Imagen test generation error:', error)
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
