import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  try {
    // 1. Seed System Settings
    await seedSystemSettings()
    console.log('✅ System Settings seeded')
    
    // 2. Seed Prompt Templates
    await seedPromptTemplates()
    console.log('✅ Prompt Templates seeded')
    
    // 3. Seed Image Settings
    await seedImageSettings()
    console.log('✅ Image Settings seeded')
    
    // 4. Seed RSS Feeds (optional)
    await seedRssFeeds()
    console.log('✅ RSS Feeds seeded')
    
    console.log('✅ Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    throw error
  }
}

async function seedSystemSettings() {
  const settings = [
    {
      key: 'site_name',
      value: 'HaberNexus'
    },
    {
      key: 'site_description',
      value: 'Yeni Nesil AI Destekli Haber Platformu'
    },
    {
      key: 'default_category',
      value: 'Gündem'
    },
    {
      key: 'ai_model_content',
      value: 'gemini-2.5-flash'
    },
    {
      key: 'ai_model_image',
      value: 'gemini-2.5-flash'
    }
  ]
  
  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
}

async function seedPromptTemplates() {
  const templates = [
    {
      name: 'content_generation',
      displayName: 'İçerik Üretim Promptu',
      description: 'Makale içeriği üretimi için kullanılan prompt',
      type: 'CONTENT' as const,
      template: 'Aşağıdaki başlık ve özet hakkında Türkçe olarak detaylı bir haber makalesi yaz. Profesyonel, tarafsız ve bilgilendirici bir ton kullan.\n\nBaşlık: {{title}}\nÖzet: {{summary}}\n\nMakale:',
      variables: JSON.stringify(['title', 'summary']),
      isActive: true,
      isDefault: true
    },
    {
      name: 'image_generation',
      displayName: 'Görsel Üretim Promptu',
      description: 'Makale görseli üretimi için kullanılan prompt',
      type: 'IMAGE' as const,
      template: 'Create a professional news article image for the following topic. The image should be visually appealing, relevant, and suitable for a news platform.\n\nTopic: {{title}}\nCategory: {{category}}\n\nImage should be in 16:9 aspect ratio.',
      variables: JSON.stringify(['title', 'category']),
      isActive: true,
      isDefault: true
    },
    {
      name: 'sentiment_analysis',
      displayName: 'Duygu Analizi Promptu',
      description: 'Makale duygu analizi için kullanılan prompt',
      type: 'SENTIMENT' as const,
      template: 'Analyze the sentiment of the following text and respond with a JSON object containing sentiment (POSITIVE, NEGATIVE, or NEUTRAL), score (0-1), and explanation.\n\nText: {{content}}\n\nRespond only with valid JSON.',
      variables: JSON.stringify(['content']),
      isActive: true,
      isDefault: true
    },
    {
      name: 'category_determination',
      displayName: 'Kategori Belirleme Promptu',
      description: 'Makale kategorisi belirleme için kullanılan prompt',
      type: 'CATEGORY' as const,
      template: 'Determine the most appropriate category for the following article from the list: Gündem, Teknoloji, Ekonomi, Spor, Sağlık, Bilim, Dünya, Kültür-Sanat.\n\nTitle: {{title}}\nContent: {{content}}\n\nRespond with only the category name.',
      variables: JSON.stringify(['title', 'content']),
      isActive: true,
      isDefault: true
    },
    {
      name: 'summary_generation',
      displayName: 'Özet Üretim Promptu',
      description: 'Makale özeti üretimi için kullanılan prompt',
      type: 'SUMMARY' as const,
      template: 'Create a brief summary (2-3 sentences) of the following article in Turkish.\n\nArticle: {{content}}\n\nSummary:',
      variables: JSON.stringify(['content']),
      isActive: true,
      isDefault: true
    }
  ]
  
  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: { name: template.name },
      update: {
        displayName: template.displayName,
        description: template.description,
        template: template.template,
        variables: template.variables,
        isActive: template.isActive,
        isDefault: template.isDefault
      },
      create: template
    })
  }
}

async function seedImageSettings() {
  const settings = [
    {
      key: 'max_width',
      value: '1200'
    },
    {
      key: 'max_height',
      value: '800'
    },
    {
      key: 'quality',
      value: '80'
    },
    {
      key: 'format',
      value: 'webp'
    },
    {
      key: 'thumbnail_width',
      value: '300'
    },
    {
      key: 'thumbnail_height',
      value: '200'
    },
    {
      key: 'cache_ttl',
      value: '86400'
    }
  ]
  
  for (const setting of settings) {
    await prisma.imageSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
}

async function seedRssFeeds() {
  // Get or create default admin user for RSS feeds
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })
  
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@habernexus.local',
        name: 'System Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
        username: 'admin'
      }
    })
  }
  
  const feeds = [
    {
      url: 'https://www.bbc.com/news/rss.xml',
      name: 'BBC News',
      category: 'Gündem',
      topicsPerRun: 2,
      authorId: adminUser.id
    },
    {
      url: 'https://feeds.bloomberg.com/markets/news.rss',
      name: 'Bloomberg Markets',
      category: 'Ekonomi',
      topicsPerRun: 2,
      authorId: adminUser.id
    },
    {
      url: 'https://feeds.theverge.com/feed',
      name: 'The Verge',
      category: 'Teknoloji',
      topicsPerRun: 2,
      authorId: adminUser.id
    }
  ]
  
  for (const feed of feeds) {
    await prisma.rssFeed.upsert({
      where: { url: feed.url },
      update: {
        name: feed.name,
        category: feed.category,
        topicsPerRun: feed.topicsPerRun
      },
      create: feed
    })
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
