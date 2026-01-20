/**
 * Full Content Pipeline Test Script
 * Tests the complete content generation pipeline with database
 * 
 * Run with: npx tsx scripts/test-full-pipeline.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

console.log('='.repeat(60))
console.log('FULL CONTENT PIPELINE TEST')
console.log('='.repeat(60))

async function checkDatabase() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 1: Database Check')
  console.log('-'.repeat(60))
  
  try {
    // Check RSS feeds
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
    })
    console.log(`✓ Active RSS feeds: ${feeds.length}`)
    
    if (feeds.length === 0) {
      console.log('  ⚠ No active RSS feeds found!')
      console.log('  → Adding sample RSS feed for testing...')
      
      // Add a sample RSS feed
      await prisma.rssFeed.create({
        data: {
          name: 'Test Feed - Teknoloji',
          url: 'https://www.ntv.com.tr/teknoloji.rss',
          category: 'Teknoloji',
          isActive: true,
        },
      })
      console.log('  ✓ Sample RSS feed added')
    } else {
      for (const feed of feeds) {
        console.log(`  - ${feed.name} (${feed.category}): ${feed.url}`)
      }
    }
    
    // Check articles
    const articleCount = await prisma.article.count()
    console.log(`✓ Total articles: ${articleCount}`)
    
    // Check system settings
    const settings = await prisma.systemSetting.findMany()
    console.log(`✓ System settings: ${settings.length}`)
    
    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    console.log(`✓ Admin user: ${adminUser ? adminUser.email : 'Not found'}`)
    
    if (!adminUser) {
      console.log('  → Creating system admin user...')
      await prisma.user.create({
        data: {
          email: 'system@habernexus.com',
          name: 'HaberNexus AI',
          role: 'ADMIN',
        },
      })
      console.log('  ✓ System admin user created')
    }
    
    return true
  } catch (error) {
    console.error('✗ Database check failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testRssFetch() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 2: RSS Feed Fetch Test')
  console.log('-'.repeat(60))
  
  try {
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
      take: 1,
    })
    
    if (feeds.length === 0) {
      console.log('✗ No RSS feeds to test')
      return false
    }
    
    const feed = feeds[0]
    console.log(`Testing feed: ${feed.name}`)
    console.log(`URL: ${feed.url}`)
    
    // Fetch RSS feed
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'HaberNexus/1.0 RSS Aggregator',
      },
    })
    
    if (!response.ok) {
      console.error(`✗ HTTP error: ${response.status}`)
      return false
    }
    
    const xml = await response.text()
    console.log(`✓ RSS feed fetched (${xml.length} bytes)`)
    
    // Simple parse to count items
    const itemCount = (xml.match(/<item>/gi) || []).length
    console.log(`✓ Items found: ${itemCount}`)
    
    return itemCount > 0
  } catch (error) {
    console.error('✗ RSS fetch failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testTopicSelection() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 3: Topic Selection Test')
  console.log('-'.repeat(60))
  
  try {
    // Import topic selector dynamically
    const { selectTopics } = await import('../lib/topic-selector')
    
    console.log('Selecting topics...')
    const result = await selectTopics(3)
    
    console.log(`✓ Topics collected: ${result.totalCollected}`)
    console.log(`✓ Topics selected: ${result.totalSelected}`)
    
    if (result.errors.length > 0) {
      console.log(`⚠ Errors: ${result.errors.join(', ')}`)
    }
    
    if (result.topics.length > 0) {
      console.log('\nSelected topics:')
      for (const topic of result.topics) {
        console.log(`  - ${topic.title.substring(0, 50)}... (score: ${topic.score})`)
      }
    }
    
    return result.success
  } catch (error) {
    console.error('✗ Topic selection failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testResearchAgent() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 4: Research Agent Test')
  console.log('-'.repeat(60))
  
  try {
    const { researchTopic, isResearchAgentConfigured } = await import('../lib/research-agent')
    
    if (!isResearchAgentConfigured()) {
      console.log('✗ Research agent not configured')
      return false
    }
    
    // Create a test topic
    const testTopic = {
      title: 'Yapay zeka teknolojisinde son gelişmeler',
      description: 'AI alanındaki yeni gelişmeler ve trendler',
      sourceUrl: 'https://example.com',
      sourceFeed: 'Test Feed',
      category: 'Teknoloji',
      score: 85,
      reasoning: 'Test topic',
      keywords: ['yapay zeka', 'AI', 'teknoloji'],
      publishedAt: new Date(),
    }
    
    console.log('Researching topic...')
    const result = await researchTopic(testTopic)
    
    console.log(`✓ Research success: ${result.success}`)
    console.log(`✓ Findings: ${result.findings.length}`)
    console.log(`✓ Sources: ${result.sources.length}`)
    console.log(`✓ Duration: ${result.researchDuration}ms`)
    
    if (result.summary) {
      console.log(`\nSummary: ${result.summary.substring(0, 100)}...`)
    }
    
    return result.success
  } catch (error) {
    console.error('✗ Research agent test failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testContentSynthesis() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 5: Content Synthesis Test')
  console.log('-'.repeat(60))
  
  try {
    const { synthesizeContent } = await import('../lib/content-synthesizer')
    
    // Create a mock research result
    const mockResearch = {
      topic: {
        title: 'Yapay Zeka Test Haberi',
        description: 'Bu bir test haberidir',
        sourceUrl: 'https://example.com',
        sourceFeed: 'Test Feed',
        category: 'Teknoloji',
        score: 85,
        reasoning: 'Test',
        keywords: ['yapay zeka', 'test'],
        publishedAt: new Date(),
      },
      success: true,
      findings: [
        {
          fact: 'Yapay zeka teknolojisi hızla gelişiyor',
          sources: ['Test kaynak'],
          confidence: 0.9,
          category: 'current' as const,
        },
        {
          fact: 'Yeni AI modelleri daha güçlü performans sunuyor',
          sources: ['Test kaynak 2'],
          confidence: 0.85,
          category: 'analysis' as const,
        },
      ],
      sources: [
        {
          title: 'Test Kaynak',
          url: 'https://example.com',
          snippet: 'Test snippet',
          relevanceScore: 0.9,
        },
      ],
      summary: 'Yapay zeka alanında önemli gelişmeler yaşanıyor.',
      keyPoints: ['Gelişme 1', 'Gelişme 2'],
      suggestedAngles: ['Genel bakış'],
      researchDuration: 1000,
      errors: [],
    }
    
    console.log('Synthesizing content...')
    const result = await synthesizeContent(mockResearch)
    
    console.log(`✓ Synthesis success: ${result.success}`)
    console.log(`✓ Quality score: ${result.qualityScore}/100`)
    console.log(`✓ Processing time: ${result.processingTime}ms`)
    
    if (result.article) {
      console.log(`\nGenerated article:`)
      console.log(`  Title: ${result.article.title}`)
      console.log(`  Category: ${result.article.category}`)
      console.log(`  Reading time: ${result.article.readingTime} min`)
      console.log(`  Content length: ${result.article.content.length} chars`)
    }
    
    return result.success
  } catch (error) {
    console.error('✗ Content synthesis test failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testImageGeneration() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 6: Image Generation Test')
  console.log('-'.repeat(60))
  
  try {
    const { generateImage, isImageGenerationConfigured } = await import('../lib/image-generator')
    
    const configured = await isImageGenerationConfigured()
    if (!configured) {
      console.log('✗ Image generation not configured')
      return false
    }
    
    console.log('Generating test image...')
    const result = await generateImage(
      'Yapay Zeka Teknolojisi Test Görseli',
      'Teknoloji'
    )
    
    console.log(`✓ Generation success: ${result.success}`)
    console.log(`✓ Provider: ${result.provider}`)
    console.log(`✓ Model: ${result.model}`)
    console.log(`✓ Duration: ${result.duration}ms`)
    
    if (result.imageUrl) {
      console.log(`✓ Image URL: ${result.imageUrl}`)
    }
    
    if (result.error) {
      console.log(`⚠ Error: ${result.error}`)
    }
    
    return result.success
  } catch (error) {
    console.error('✗ Image generation test failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

async function testUnifiedEngine() {
  console.log('\n' + '-'.repeat(60))
  console.log('STEP 7: Unified Content Engine Test')
  console.log('-'.repeat(60))
  
  try {
    const { runContentEngine, getEngineStatus } = await import('../lib/unified-content-engine')
    
    // Get engine status
    const status = await getEngineStatus()
    console.log(`Engine configured: ${status.isConfigured}`)
    console.log(`Research enabled: ${status.isResearchEnabled}`)
    console.log(`Image gen enabled: ${status.isImageGenEnabled}`)
    console.log(`Active feeds: ${status.activeFeeds}`)
    
    // Run in test mode
    console.log('\nRunning engine in test mode...')
    const result = await runContentEngine('test')
    
    console.log(`\n✓ Engine success: ${result.success}`)
    console.log(`✓ Mode: ${result.mode}`)
    console.log(`✓ Topics collected: ${result.topicsCollected}`)
    console.log(`✓ Topics selected: ${result.topicsSelected}`)
    console.log(`✓ Topics researched: ${result.topicsResearched}`)
    console.log(`✓ Articles generated: ${result.articlesGenerated}`)
    console.log(`✓ Duration: ${result.totalDuration}ms`)
    
    if (result.stages.length > 0) {
      console.log('\nPipeline stages:')
      for (const stage of result.stages) {
        const duration = stage.endTime && stage.startTime 
          ? `(${stage.endTime - stage.startTime}ms)` 
          : ''
        console.log(`  ${stage.status === 'completed' ? '✓' : stage.status === 'failed' ? '✗' : '○'} ${stage.name} ${duration}`)
        if (stage.details) {
          console.log(`    ${stage.details}`)
        }
      }
    }
    
    if (result.errors.length > 0) {
      console.log('\nErrors:')
      for (const error of result.errors) {
        console.log(`  - ${error}`)
      }
    }
    
    if (result.testArticle) {
      console.log('\nTest article:')
      console.log(`  Title: ${result.testArticle.title}`)
      console.log(`  Category: ${result.testArticle.category}`)
    }
    
    return result.success
  } catch (error) {
    console.error('✗ Unified engine test failed!')
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('\nStarting full pipeline test...\n')
  
  const results = {
    database: await checkDatabase(),
    rssFetch: await testRssFetch(),
    topicSelection: await testTopicSelection(),
    researchAgent: await testResearchAgent(),
    contentSynthesis: await testContentSynthesis(),
    imageGeneration: await testImageGeneration(),
    unifiedEngine: await testUnifiedEngine(),
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))
  
  const tests = [
    { name: 'Database', result: results.database },
    { name: 'RSS Fetch', result: results.rssFetch },
    { name: 'Topic Selection', result: results.topicSelection },
    { name: 'Research Agent', result: results.researchAgent },
    { name: 'Content Synthesis', result: results.contentSynthesis },
    { name: 'Image Generation', result: results.imageGeneration },
    { name: 'Unified Engine', result: results.unifiedEngine },
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
  
  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

runAllTests().catch(async (error) => {
  console.error('Test runner error:', error)
  await prisma.$disconnect()
  process.exit(1)
})
