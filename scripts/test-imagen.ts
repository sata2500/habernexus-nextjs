/**
 * Imagen API Test Script
 * Tests the image generation functionality with real API calls
 * 
 * Usage: GEMINI_API_KEY=your_key npx ts-node scripts/test-imagen.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables with validation
const envApiKey = process.env.GEMINI_API_KEY

if (!envApiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY environment variable is not set')
  console.error('Usage: GEMINI_API_KEY=your_key npx ts-node scripts/test-imagen.ts')
  process.exit(1)
}

// Now we know it's defined, assign to a non-nullable constant
const GEMINI_API_KEY: string = envApiKey

console.log('='.repeat(60))
console.log('IMAGEN API TEST SCRIPT')
console.log('='.repeat(60))
console.log(`API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`)
console.log('')

// Initialize client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Test models
const MODELS_TO_TEST = [
  'imagen-3.0-generate-002',
  'imagen-4.0-generate-001',
  'imagen-4.0-fast-generate-001',
]

// Test prompts
const TEST_PROMPTS = [
  {
    title: 'Technology News',
    prompt: 'A sleek, modern environment with glowing data visualizations and innovative gadgets. Clean lines, blue and silver tones, a sense of progress and innovation. Professional news article header image, 16:9 aspect ratio, no text.',
    category: 'Teknoloji',
  },
  {
    title: 'Economy News',
    prompt: 'A professional corporate meeting room with financial charts on screens. Business professionals in action. Mood is optimistic. Professional news article header image, 16:9 aspect ratio, no text.',
    category: 'Ekonomi',
  },
]

async function testModel(modelName: string, prompt: string): Promise<{
  success: boolean
  error?: string
  imageSize?: number
  duration?: number
}> {
  const startTime = Date.now()
  
  try {
    console.log(`\n[TEST] Model: ${modelName}`)
    console.log(`[TEST] Prompt: ${prompt.substring(0, 80)}...`)
    
    const response = await genAI.models.generateImages({
      model: modelName,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    })
    
    const duration = Date.now() - startTime
    
    console.log(`[TEST] Response received in ${duration}ms`)
    console.log(`[TEST] Generated images count: ${response.generatedImages?.length || 0}`)
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      return {
        success: false,
        error: 'No images generated',
        duration,
      }
    }
    
    const generatedImage = response.generatedImages[0]
    
    // Log response structure
    console.log(`[TEST] Image object keys: ${generatedImage.image ? Object.keys(generatedImage.image) : 'null'}`)
    
    if (!generatedImage.image) {
      return {
        success: false,
        error: 'No image data in response',
        duration,
      }
    }
    
    // Check for imageBytes
    const imageData = generatedImage.image as { imageBytes?: string; mimeType?: string }
    
    if (!imageData.imageBytes) {
      console.log(`[TEST] Image data structure:`, JSON.stringify(generatedImage.image, null, 2).substring(0, 500))
      return {
        success: false,
        error: 'No imageBytes in response',
        duration,
      }
    }
    
    console.log(`[TEST] imageBytes length: ${imageData.imageBytes.length}`)
    console.log(`[TEST] mimeType: ${imageData.mimeType || 'not specified'}`)
    
    // Try to decode and save
    const buffer = Buffer.from(imageData.imageBytes, 'base64')
    console.log(`[TEST] Decoded buffer size: ${buffer.length} bytes`)
    
    if (buffer.length < 1000) {
      return {
        success: false,
        error: `Buffer too small: ${buffer.length} bytes`,
        duration,
      }
    }
    
    // Save test image
    const outputDir = path.join(process.cwd(), 'public', 'images', 'test')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const filename = `test-${modelName.replace(/\./g, '-')}-${Date.now()}.png`
    const filePath = path.join(outputDir, filename)
    
    fs.writeFileSync(filePath, buffer)
    
    // Verify file
    const stats = fs.statSync(filePath)
    console.log(`[TEST] Saved to: ${filePath} (${stats.size} bytes)`)
    
    return {
      success: true,
      imageSize: stats.size,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[TEST] Error: ${errorMessage}`)
    
    if (error instanceof Error && error.stack) {
      console.error(`[TEST] Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
    }
    
    return {
      success: false,
      error: errorMessage,
      duration,
    }
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60))
  console.log('STARTING TESTS')
  console.log('='.repeat(60))
  
  const results: Array<{
    model: string
    prompt: string
    success: boolean
    error?: string
    imageSize?: number
    duration?: number
  }> = []
  
  // Test each model with first prompt
  for (const model of MODELS_TO_TEST) {
    const testPrompt = TEST_PROMPTS[0]
    const result = await testModel(model, testPrompt.prompt)
    results.push({
      model,
      prompt: testPrompt.title,
      ...result,
    })
    
    // Wait between requests to avoid rate limiting
    if (result.success) {
      console.log(`[TEST] Waiting 2 seconds before next test...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))
  
  for (const result of results) {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED'
    console.log(`\n${status}: ${result.model}`)
    if (result.success) {
      console.log(`  - Image size: ${result.imageSize} bytes`)
      console.log(`  - Duration: ${result.duration}ms`)
    } else {
      console.log(`  - Error: ${result.error}`)
    }
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`\n${'='.repeat(60)}`)
  console.log(`TOTAL: ${successCount}/${results.length} tests passed`)
  console.log('='.repeat(60))
  
  return results
}

// Run tests
runTests()
  .then(results => {
    process.exit(results.every(r => r.success) ? 0 : 1)
  })
  .catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
