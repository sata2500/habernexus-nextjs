const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RSS feeds...');

  // Sample RSS feeds - Popular Turkish news sources
  const feeds = [
    {
      name: 'BBC Türkçe',
      url: 'https://www.bbc.com/turkce/index.xml',
      category: 'Genel Haberler',
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'CNN Türk',
      url: 'https://www.cnnturk.com/feed/rss/news/world',
      category: 'Dünya Haberleri',
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'Haber Türk',
      url: 'https://www.haberturk.com/rss',
      category: 'Genel Haberler',
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      category: 'Teknoloji',
      topicsPerRun: 2,
      imageMode: 'auto',
    },
    {
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      category: 'Teknoloji',
      topicsPerRun: 2,
      imageMode: 'auto',
    },
  ];

  for (const feed of feeds) {
    const existing = await prisma.rssFeed.findUnique({
      where: { url: feed.url },
    });

    if (!existing) {
      const created = await prisma.rssFeed.create({
        data: {
          ...feed,
          isActive: true,
        },
      });
      console.log(`✅ Created: ${created.name}`);
    } else {
      console.log(`⏭️  Already exists: ${existing.name}`);
    }
  }

  console.log('\n📊 RSS Feeds Summary:');
  const allFeeds = await prisma.rssFeed.findMany();
  console.log(`Total feeds: ${allFeeds.length}`);
  console.log(JSON.stringify(allFeeds, null, 2));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
