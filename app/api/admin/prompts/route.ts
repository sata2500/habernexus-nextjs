import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAllPrompts, createPrompt, seedDefaultPrompts } from '@/lib/prompts'
import { PromptType } from '@prisma/client'

/**
 * GET /api/admin/prompts
 * Get all prompt templates
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

    const prompts = await getAllPrompts()
    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Get prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/prompts
 * Create a new prompt template or seed defaults
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

    // Check if this is a seed request
    if (body.action === 'seed') {
      const results = await seedDefaultPrompts()
      return NextResponse.json({ 
        success: true, 
        message: 'Default prompts seeded',
        results 
      })
    }

    // Validate required fields
    if (!body.name || !body.displayName || !body.type || !body.template) {
      return NextResponse.json(
        { error: 'Missing required fields: name, displayName, type, template' },
        { status: 400 }
      )
    }

    // Validate prompt type
    const validTypes: PromptType[] = ['CONTENT', 'IMAGE', 'SENTIMENT', 'CATEGORY', 'SUMMARY']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid prompt type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const prompt = await createPrompt({
      name: body.name,
      displayName: body.displayName,
      description: body.description,
      type: body.type as PromptType,
      template: body.template,
      variables: body.variables || [],
      isDefault: body.isDefault || false,
    })

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    console.error('Create prompt error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A prompt with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
