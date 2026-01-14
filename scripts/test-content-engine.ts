/**
 * Content Engine Full Test Script
 * Tests the complete content generation pipeline including image generation
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

console.log('='.repeat(60))
console.log('CONTENT ENGINE FULL TEST')
console.log('='.repeat(60))

// Initialize client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Test categories and titles
const TEST_ARTICLES = [
  {
    title: 'Yapay Zeka Teknolojileri 2026 Yılında Büyük İlerleme Kaydetti',
    category: 'Teknoloji',
    description: 'Yapay zeka alanında 2026 yılında kaydedilen gelişmeler ve yenilikler hakkında detaylı bir inceleme.',
  },
  {
    title: 'Merkez Bankası Faiz Kararını Açıkladı',
    category: 'Ekonomi',
    description: 'Merkez Bankası\'nın son faiz kararı ve ekonomiye etkileri.',
  },
  {
    title: 'Yeni Keşfedilen Gezegen Yaşam İzleri Taşıyor Olabilir',
    category: 'Bilim',
    description: 'Astronomlar tarafından keşfedilen yeni gezegenin özellikleri.',
  },
]

// Image generation settings
const IMAGE_MODEL = 'imagen-4.0-fast-generate-001'

// Category-specific styles
const CATEGORY_STYLES: Record<string, string> = {
  'Teknoloji': 'A sleek, modern environment with glowing data visualizations, holographic displays, and innovative gadgets. Clean lines, blue and silver tones, a sense of progress and innovation.',
  'Ekonomi': 'A professional corporate setting with financial charts, stock tickers, and business professionals. Modern office environment with glass walls and city skyline.',
  'Bilim': 'A scientific laboratory or observatory setting with advanced equipment, telescopes, or microscopes. Deep space imagery or molecular structures in the background.',
  'Spor': 'Dynamic sports action shot with athletes in motion, stadium atmosphere, and energetic crowd.',
  'Gündem': 'A journalistic scene capturing current events, press conferences, or street photography style.',
  'Dünya': 'International landmarks, diplomatic settings, or global news imagery with diverse cultural elements.',
  'Sağlık': 'Modern medical facility, healthcare professionals, or wellness-focused imagery with clean, bright aesthetics.',
  'Kültür-Sanat': 'Artistic and cultural imagery featuring museums, theaters, or creative performances.',
}

async function generateImagePrompt(title: string, category: string): Promise<string> {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['Teknoloji']
  
  return `An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

Subject: "${title}"
Category: ${category}

Scene Description:
${style}. The scene is rich with authentic details, conveying a powerful narrative. If people are present, their expressions and actions are natural and meaningful, reflecting the core of the news story. The environment is highly detailed and contextually appropriate.

Composition & Framing:
Masterful composition, using the rule of thirds. A compelling medium shot or a wide shot that establishes the scene. The main subject is in sharp focus, with a natural depth of field that draws the viewer's eye.

Lighting:
Dramatic and natural lighting that enhances the mood. Could be the soft glow of golden hour, the crisp light of a modern office, or the dynamic lighting of a live event. Avoid flat or artificial lighting.

Atmosphere & Mood:
The image should evoke a specific emotion relevant to the story: urgency, hope, innovation, tension, or contemplation. The overall tone is professional, suitable for a leading news publication.

Technical Details:
Shot on a Sony a7R V with a G Master lens (e.g., 50mm f/1.2 or 24-70mm f/2.8). 16:9 aspect ratio. Hyper-detailed, sharp, and clear.

Important: Do not include any text, logos, or watermarks in the image.`
}

async function generateImage(title: string, category: string): Promise<{
  success: boolean
  imageUrl?: string
  error?: string
  duration?: number
}> {
  const startTime = Date.now()
  
  try {
    const prompt = await generateImagePrompt(title, category)
    
    console.log(`\n[IMAGE] Generating image for: ${title.substring(0, 50)}...`)
    console.log(`[IMAGE] Category: ${category}`)
    console.log(`[IMAGE] Model: ${IMAGE_MODEL}`)
    
    const response = await genAI.models.generateImages({
      model: IMAGE_MODEL,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    })
    
    const duration = Date.now() - startTime
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      return {
        success: false,
        error: 'No images generated',
        duration,
      }
    }
    
    const generatedImage = response.generatedImages[0]
    const imageData = generatedImage.image as { imageBytes?: string; mimeType?: string }
    
    if (!imageData?.imageBytes) {
      return {
        success: false,
        error: 'No image bytes in response',
        duration,
      }
    }
    
    // Save image
    const buffer = Buffer.from(imageData.imageBytes, 'base64')
    
    if (buffer.length < 1000) {
      return {
        success: false,
        error: `Buffer too small: ${buffer.length} bytes`,
        duration,
      }
    }
    
    // Generate filename
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
    
    const outputDir = path.join(process.cwd(), 'public', 'images', 'generated')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const filename = `${slug}-${Date.now()}.png`
    const filePath = path.join(outputDir, filename)
    
    fs.writeFileSync(filePath, buffer)
    
    const stats = fs.statSync(filePath)
    console.log(`[IMAGE] Saved: ${filePath} (${stats.size} bytes) in ${duration}ms`)
    
    return {
      success: true,
      imageUrl: `/images/generated/${filename}`,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[IMAGE] Error: ${errorMessage}`)
    
    return {
      success: false,
      error: errorMessage,
      duration,
    }
  }
}

async function runFullTest() {
  console.log('\n' + '='.repeat(60))
  console.log('STARTING FULL CONTENT ENGINE TEST')
  console.log('='.repeat(60))
  
  const results: Array<{
    title: string
    category: string
    success: boolean
    imageUrl?: string
    error?: string
    duration?: number
  }> = []
  
  for (const article of TEST_ARTICLES) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`Testing: ${article.title}`)
    console.log(`Category: ${article.category}`)
    console.log('─'.repeat(60))
    
    const result = await generateImage(article.title, article.category)
    
    results.push({
      title: article.title,
      category: article.category,
      ...result,
    })
    
    // Wait between requests
    if (result.success) {
      console.log(`[TEST] Waiting 3 seconds before next test...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌'
    console.log(`\n${status} ${result.title.substring(0, 40)}...`)
    console.log(`   Category: ${result.category}`)
    if (result.success) {
      console.log(`   Image: ${result.imageUrl}`)
      console.log(`   Duration: ${result.duration}ms`)
    } else {
      console.log(`   Error: ${result.error}`)
    }
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`\n${'='.repeat(60)}`)
  console.log(`TOTAL: ${successCount}/${results.length} images generated successfully`)
  console.log('='.repeat(60))
  
  // List generated images
  const generatedDir = path.join(process.cwd(), 'public', 'images', 'generated')
  if (fs.existsSync(generatedDir)) {
    const files = fs.readdirSync(generatedDir).filter(f => f.endsWith('.png'))
    console.log(`\nGenerated images in ${generatedDir}:`)
    files.forEach(f => {
      const stats = fs.statSync(path.join(generatedDir, f))
      console.log(`  - ${f} (${Math.round(stats.size / 1024)}KB)`)
    })
  }
  
  return results
}

// Run tests
runFullTest()
  .then(results => {
    const allSuccess = results.every(r => r.success)
    console.log(`\nTest completed ${allSuccess ? 'successfully' : 'with errors'}`)
    process.exit(allSuccess ? 0 : 1)
  })
  .catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
