/**
 * Unified Content Engine Test Script
 * Tests the complete content generation pipeline directly
 * 
 * Run with: npx tsx scripts/test-unified-engine.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

import { GoogleGenAI } from '@google/genai'

console.log('='.repeat(60))
console.log('UNIFIED CONTENT ENGINE TEST')
console.log('='.repeat(60))

// Check environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
console.log(`\n[ENV] GEMINI_API_KEY: ${GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`)
console.log(`[ENV] Key prefix: ${GEMINI_API_KEY?.substring(0, 10)}...`)

if (!GEMINI_API_KEY) {
  console.error('\n❌ ERROR: No API key found!')
  console.error('Please set GEMINI_API_KEY or GOOGLE_API_KEY in .env file')
  process.exit(1)
}

// Initialize client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Test 1: Basic text generation
async function testTextGeneration() {
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 1: Basic Text Generation')
  console.log('-'.repeat(60))
  
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Merhaba, bu bir test mesajıdır. Kısa bir cevap ver.',
      config: {
        temperature: 0.5,
        maxOutputTokens: 100,
      },
    })
    
    console.log('✓ Text generation successful!')
    console.log(`Response: ${response.text?.substring(0, 100)}...`)
    return true
  } catch (error) {
    console.error('✗ Text generation failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

// Test 2: Content generation with search grounding
async function testContentWithGrounding() {
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 2: Content Generation with Search Grounding')
  console.log('-'.repeat(60))
  
  try {
    const prompt = `Sen bir haber editörüsün. "Yapay zeka teknolojisinde son gelişmeler" konusunda kısa bir haber özeti yaz.
    
ÇIKTI FORMATI (JSON):
{
  "title": "Haber başlığı",
  "content": "Haber içeriği",
  "excerpt": "Kısa özet"
}`
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        tools: [{ googleSearch: {} }],
      },
    })
    
    console.log('✓ Content generation with grounding successful!')
    
    // Check for grounding metadata
    const metadata = response.candidates?.[0]?.groundingMetadata
    if (metadata?.webSearchQueries) {
      console.log(`Search queries: ${metadata.webSearchQueries.join(', ')}`)
    }
    if (metadata?.groundingChunks) {
      console.log(`Sources found: ${metadata.groundingChunks.length}`)
    }
    
    // Parse JSON response
    const text = response.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      console.log(`Generated title: ${result.title?.substring(0, 50)}...`)
    }
    
    return true
  } catch (error) {
    console.error('✗ Content generation with grounding failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

// Test 3: Image generation with Imagen
async function testImageGeneration() {
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 3: Image Generation (Imagen 4.0)')
  console.log('-'.repeat(60))
  
  try {
    const prompt = 'A professional news photograph showing modern technology, clean and minimal style, 16:9 aspect ratio'
    
    console.log('Generating image...')
    const response = await genAI.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    })
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.error('✗ No images generated')
      return false
    }
    
    const image = response.generatedImages[0]
    const imageData = image.image as { imageBytes?: string; mimeType?: string }
    
    if (!imageData?.imageBytes) {
      console.error('✗ No image bytes in response')
      return false
    }
    
    const buffer = Buffer.from(imageData.imageBytes, 'base64')
    console.log(`✓ Image generated successfully!`)
    console.log(`  Size: ${buffer.length} bytes`)
    console.log(`  MIME type: ${imageData.mimeType}`)
    
    return true
  } catch (error) {
    console.error('✗ Image generation failed!')
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${errorMessage}`)
    
    // Check for specific error types
    if (errorMessage.includes('quota')) {
      console.error('  → API quota exceeded')
    } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
      console.error('  → API permission denied - check if Imagen API is enabled')
    } else if (errorMessage.includes('model')) {
      console.error('  → Model not available - check model name')
    }
    
    return false
  }
}

// Test 4: Nano Banana (Gemini native image generation)
async function testNanoBanana() {
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 4: Nano Banana (Gemini Native Image Generation)')
  console.log('-'.repeat(60))
  
  try {
    const prompt = 'Create a professional news photograph showing a modern cityscape at sunset, photorealistic style'
    
    console.log('Generating image with Nano Banana...')
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    })
    
    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts
    if (!parts) {
      console.error('✗ No response parts')
      return false
    }
    
    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        console.log(`✓ Image generated successfully!`)
        console.log(`  Size: ${buffer.length} bytes`)
        console.log(`  MIME type: ${part.inlineData.mimeType}`)
        return true
      }
    }
    
    console.error('✗ No image in response')
    return false
  } catch (error) {
    console.error('✗ Nano Banana generation failed!')
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${errorMessage}`)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('\nStarting tests...\n')
  
  const results = {
    textGeneration: await testTextGeneration(),
    contentWithGrounding: await testContentWithGrounding(),
    imageGeneration: await testImageGeneration(),
    nanoBanana: await testNanoBanana(),
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))
  
  const tests = [
    { name: 'Text Generation', result: results.textGeneration },
    { name: 'Content with Grounding', result: results.contentWithGrounding },
    { name: 'Imagen 4.0', result: results.imageGeneration },
    { name: 'Nano Banana', result: results.nanoBanana },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const status = test.result ? '✓ PASS' : '✗ FAIL'
    console.log(`${status} - ${test.name}`)
    if (test.result) passed++
    else failed++
  }
  
  console.log('\n' + '-'.repeat(60))
  console.log(`Total: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(60))
  
  // Recommendations
  if (failed > 0) {
    console.log('\n📋 RECOMMENDATIONS:')
    
    if (!results.textGeneration) {
      console.log('  1. Check if GEMINI_API_KEY is valid')
      console.log('  2. Verify API key has access to Gemini models')
    }
    
    if (!results.imageGeneration) {
      console.log('  1. Enable Imagen API in Google Cloud Console')
      console.log('  2. Check if your API key has image generation permissions')
      console.log('  3. Verify billing is enabled for your project')
    }
    
    if (!results.nanoBanana) {
      console.log('  1. Nano Banana requires experimental model access')
      console.log('  2. Try using Imagen 4.0 as primary image generator')
    }
  }
  
  process.exit(failed > 0 ? 1 : 0)
}

runAllTests().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})
