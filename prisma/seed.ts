/**
 * Database Seed Script
 * Initialize database with essential data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  console.log('Creating admin user...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@habernexus.com' },
    update: {},
    create: {
      email: 'admin@habernexus.com',
      name: 'HaberNexus Admin',
      role: 'ADMIN',
    },
  })
  console.log(`✓ Admin user: ${admin.email}`)

  // 2. Create system settings
  console.log('Creating system settings...')
  
  const settings = [
    // Content Engine Settings
    { key: 'content_engine_content_model', value: 'gemini-3-flash' },
    { key: 'content_engine_image_model', value: 'imagen-4.0-fast-generate-001' },
    { key: 'content_engine_summary_model', value: 'gemini-3-flash' },
    { key: 'content_engine_topics_per_feed', value: '2' },
    { key: 'content_engine_max_concurrent', value: '3' },
    { key: 'content_engine_image_mode', value: 'auto' },
    { key: 'content_engine_image_quality', value: '85' },
    { key: 'content_engine_image_max_width', value: '1200' },
    { key: 'content_engine_summary_cache_days', value: '30' },
    { key: 'content_engine_duplicate_check_days', value: '30' },
    { key: 'content_engine_duplicate_similarity', value: '0.7' },
    { key: 'content_engine_cron_schedule', value: '0 */6 * * *' },
    { key: 'content_engine_schedule_enabled', value: 'false' },
    
    // Breaking News Settings
    { key: 'breaking_news_enabled', value: 'true' },
    { key: 'breaking_news_frequency_hours', value: '1' },
    { key: 'breaking_news_keywords', value: 'son dakika,breaking,acil,şimdi,önemli' },
    { key: 'breaking_news_auto_detect', value: 'true' },
    
    // Site Settings
    { key: 'site_name', value: 'HaberNexus' },
    { key: 'site_description', value: 'Yeni Nesil AI Destekli Haber Platformu' },
    { key: 'default_category', value: 'Gündem' },
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log(`✓ Created ${settings.length} system settings`)

  // 3. Create sample RSS feeds
  console.log('Creating sample RSS feeds...')
  
  const feeds = [
    {
      name: 'NTV - Teknoloji',
      url: 'https://www.ntv.com.tr/teknoloji.rss',
      category: 'Teknoloji',
      isActive: true,
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'NTV - Ekonomi',
      url: 'https://www.ntv.com.tr/ekonomi.rss',
      category: 'Ekonomi',
      isActive: true,
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'NTV - Gündem',
      url: 'https://www.ntv.com.tr/turkiye.rss',
      category: 'Gündem',
      isActive: true,
      topicsPerRun: 2,
      imageMode: 'auto',
    },
  ]

  for (const feed of feeds) {
    await prisma.rssFeed.upsert({
      where: { url: feed.url },
      update: {},
      create: feed,
    })
  }
  console.log(`✓ Created ${feeds.length} RSS feeds`)

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
