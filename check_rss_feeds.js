const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== RSS Feeds ===');
  const feeds = await prisma.rssFeed.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      isActive: true,
      topicsPerRun: true,
      lastFetch: true,
    },
  });
  
  console.log(`Total feeds: ${feeds.length}`);
  console.log(JSON.stringify(feeds, null, 2));
  
  console.log('\n=== Recent Articles ===');
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      sourceFeedId: true,
    },
    take: 10,
  });
  
  console.log(`Articles in last 7 days: ${articles.length}`);
  console.log(JSON.stringify(articles, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
