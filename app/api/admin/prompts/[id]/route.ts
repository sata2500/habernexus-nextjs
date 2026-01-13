import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { updatePrompt, deletePrompt } from '@/lib/prompts'

/**
 * GET /api/admin/prompts/[id]
 * Get a specific prompt template
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error('Get prompt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/prompts/[id]
 * Update a prompt template
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if prompt exists
    const existing = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Update the prompt
    const updated = await updatePrompt(id, {
      template: body.template,
      displayName: body.displayName,
      description: body.description,
      isActive: body.isActive,
      isDefault: body.isDefault,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update prompt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/prompts/[id]
 * Delete a prompt template
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if prompt exists
    const existing = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Cannot delete default prompts
    if (existing.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default prompt template. Set another prompt as default first.' },
        { status: 400 }
      )
    }

    await deletePrompt(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prompt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
