const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database cleanup...');

  try {
    // Sequence is important due to foreign key constraints if they were strictly enforced, 
    // but with onDelete: Cascade it's easier.
    
    const tables = [
      'Bookmark',
      'ArticleVote',
      'CommentLike',
      'Comment',
      'Notification',
      'Follow',
      'Article',
      'ImageError',
      'ImageStats',
      'ContactMessage',
      'DeploymentHistory',
      'ContentEngineRun',
      'DataTransfer'
    ];

    for (const table of tables) {
      console.log(`Cleaning table: ${table}...`);
      await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
    }

    console.log('Database cleanup completed successfully.');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
