/**
 * Test All Imagen Models Script
 * Tests all available Imagen models to verify API access
 * 
 * Usage: GEMINI_API_KEY=your_key npx ts-node scripts/test-all-imagen-models.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables with validation
const envApiKey = process.env.GEMINI_API_KEY

if (!envApiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY environment variable is not set')
  console.error('Usage: GEMINI_API_KEY=your_key npx ts-node scripts/test-all-imagen-models.ts')
  process.exit(1)
}

// Now we know it's defined, assign to a non-nullable constant
const GEMINI_API_KEY: string = envApiKey

console.log('='.repeat(70))
console.log('IMAGEN API - ALL MODELS TEST')
console.log('='.repeat(70))
console.log(`API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`)
console.log('')

// Initialize client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// All known Imagen models to test
const IMAGEN_MODELS = [
  // Imagen 4 Stable (GA) Models
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0 Standard',
    status: 'stable',
    description: 'Standard quality, high detail',
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4.0 Ultra',
    status: 'stable',
    description: 'Ultra quality (2K), highest detail',
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4.0 Fast',
    status: 'stable',
    description: 'Fast generation, good quality',
  },
  // Imagen 4 Preview Models
  {
    id: 'imagen-4.0-generate-preview-06-06',
    name: 'Imagen 4.0 Preview',
    status: 'preview',
    description: 'Preview version (shutting down Feb 2026)',
  },
  {
    id: 'imagen-4.0-ultra-generate-preview-06-06',
    name: 'Imagen 4.0 Ultra Preview',
    status: 'preview',
    description: 'Ultra preview version (shutting down Feb 2026)',
  },
  // Imagen 3 Models (deprecated)
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3.0',
    status: 'deprecated',
    description: 'Deprecated - shut down Nov 2025',
  },
  {
    id: 'imagen-3.0-generate-001',
    name: 'Imagen 3.0 v1',
    status: 'deprecated',
    description: 'Deprecated - older version',
  },
]

// Simple test prompt
const TEST_PROMPT = 'A beautiful sunset over mountains with a calm lake in the foreground. Photorealistic, 16:9 aspect ratio, no text.'

interface TestResult {
  modelId: string
  modelName: string
  status: string
  success: boolean
  duration?: number
  imageSize?: number
  error?: string
}

async function testModel(model: typeof IMAGEN_MODELS[0]): Promise<TestResult> {
  const startTime = Date.now()
  
  console.log(`\n${'─'.repeat(70)}`)
  console.log(`Testing: ${model.name} (${model.id})`)
  console.log(`Status: ${model.status}`)
  console.log('─'.repeat(70))
  
  try {
    const response = await genAI.models.generateImages({
      model: model.id,
      prompt: TEST_PROMPT,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    })
    
    const duration = Date.now() - startTime
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.log(`❌ No images generated`)
      return {
        modelId: model.id,
        modelName: model.name,
        status: model.status,
        success: false,
        duration,
        error: 'No images generated',
      }
    }
    
    const generatedImage = response.generatedImages[0]
    const imageData = generatedImage.image as { imageBytes?: string; mimeType?: string }
    
    if (!imageData?.imageBytes) {
      console.log(`❌ No image bytes in response`)
      return {
        modelId: model.id,
        modelName: model.name,
        status: model.status,
        success: false,
        duration,
        error: 'No image bytes',
      }
    }
    
    // Decode and save
    const buffer = Buffer.from(imageData.imageBytes, 'base64')
    
    if (buffer.length < 1000) {
      console.log(`❌ Buffer too small: ${buffer.length} bytes`)
      return {
        modelId: model.id,
        modelName: model.name,
        status: model.status,
        success: false,
        duration,
        error: `Buffer too small: ${buffer.length} bytes`,
      }
    }
    
    // Save test image
    const outputDir = path.join(process.cwd(), 'public', 'images', 'model-tests')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const filename = `${model.id.replace(/\./g, '-')}-${Date.now()}.png`
    const filePath = path.join(outputDir, filename)
    
    fs.writeFileSync(filePath, buffer)
    
    const stats = fs.statSync(filePath)
    console.log(`✅ SUCCESS - ${stats.size} bytes in ${duration}ms`)
    console.log(`   Saved: ${filePath}`)
    
    return {
      modelId: model.id,
      modelName: model.name,
      status: model.status,
      success: true,
      duration,
      imageSize: stats.size,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Parse error for more details
    let shortError = errorMessage
    if (errorMessage.includes('404')) {
      shortError = 'Model not found (404)'
    } else if (errorMessage.includes('403')) {
      shortError = 'Access denied (403)'
    } else if (errorMessage.includes('429')) {
      shortError = 'Rate limited (429)'
    } else if (errorMessage.includes('quota')) {
      shortError = 'Quota exceeded'
    }
    
    console.log(`❌ FAILED - ${shortError}`)
    
    return {
      modelId: model.id,
      modelName: model.name,
      status: model.status,
      success: false,
      duration,
      error: shortError,
    }
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70))
  console.log('STARTING ALL MODEL TESTS')
  console.log('='.repeat(70))
  
  const results: TestResult[] = []
  
  for (const model of IMAGEN_MODELS) {
    const result = await testModel(model)
    results.push(result)
    
    // Wait between requests to avoid rate limiting
    if (result.success) {
      console.log(`Waiting 3 seconds before next test...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    } else {
      // Shorter wait for failed tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(70))
  console.log('TEST SUMMARY')
  console.log('='.repeat(70))
  
  console.log('\n### Working Models (✅)')
  const workingModels = results.filter(r => r.success)
  if (workingModels.length === 0) {
    console.log('   None')
  } else {
    for (const result of workingModels) {
      console.log(`   ${result.modelId}`)
      console.log(`      - Duration: ${result.duration}ms`)
      console.log(`      - Image size: ${Math.round((result.imageSize || 0) / 1024)}KB`)
    }
  }
  
  console.log('\n### Failed Models (❌)')
  const failedModels = results.filter(r => !r.success)
  if (failedModels.length === 0) {
    console.log('   None')
  } else {
    for (const result of failedModels) {
      console.log(`   ${result.modelId}`)
      console.log(`      - Status: ${result.status}`)
      console.log(`      - Error: ${result.error}`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log(`TOTAL: ${workingModels.length}/${results.length} models working`)
  console.log('='.repeat(70))
  
  // Generate JSON report - ensure directory exists
  const reportDir = path.join(process.cwd(), 'docs', 'ai-knowledge-base', 'research')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const reportPath = path.join(reportDir, 'imagen-model-test-results.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    testDate: new Date().toISOString(),
    apiKey: `${GEMINI_API_KEY.substring(0, 10)}...`,
    results,
    summary: {
      total: results.length,
      working: workingModels.length,
      failed: failedModels.length,
    },
  }, null, 2))
  
  console.log(`\nReport saved to: ${reportPath}`)
  
  return results
}

// Run tests
runAllTests()
  .then(results => {
    const workingCount = results.filter(r => r.success).length
    console.log(`\nTest completed: ${workingCount}/${results.length} models working`)
    process.exit(0)
  })
  .catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
