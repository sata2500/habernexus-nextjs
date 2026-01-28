/**
 * Model Validation API Endpoint
 * Validates AI models and checks API health
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  validateModel,
  validateModels,
  checkAPIHealth,
  checkModelCompatibility,
  validateModelForUseCase,
  getModelRecommendations,
  getCachedValidation,
  cacheValidation,
} from '@/lib/model-validation'

/**
 * GET /api/admin/models/validate
 * Check API health and model availability
 */
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')
    const useCase = searchParams.get('useCase') as 'content' | 'image' | 'summary' | null

    // Single model validation
    if (modelId) {
      // Check cache first
      let result = getCachedValidation(modelId)

      if (!result) {
        result = await validateModel(modelId)
        cacheValidation(result)
      }

      // Check compatibility if use case is specified
      if (useCase) {
        const compatibility = checkModelCompatibility(modelId, useCase)
        const validation = validateModelForUseCase(modelId, useCase)

        return NextResponse.json({
          model: result,
          compatibility,
          validation,
        })
      }

      return NextResponse.json({ model: result })
    }

    // API health check
    const health = await checkAPIHealth()

    return NextResponse.json({
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Model Validation API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/models/validate
 * Validate multiple models or get recommendations
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
    const { modelIds, useCase, action } = body

    // Get recommendations
    if (action === 'recommend' && useCase) {
      const recommendations = getModelRecommendations(useCase)

      return NextResponse.json({
        useCase,
        recommendations,
        timestamp: new Date().toISOString(),
      })
    }

    // Validate multiple models
    if (modelIds && Array.isArray(modelIds)) {
      const results = await validateModels(modelIds)

      // Add compatibility info if use case is specified
      if (useCase) {
        const withCompatibility = results.map(result => ({
          ...result,
          compatibility: checkModelCompatibility(result.modelId, useCase),
          validation: validateModelForUseCase(result.modelId, useCase),
        }))

        return NextResponse.json({
          models: withCompatibility,
          timestamp: new Date().toISOString(),
        })
      }

      return NextResponse.json({
        models: results,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Model Validation API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
