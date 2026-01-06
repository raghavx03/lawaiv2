// Clear old cached drafts
const { PrismaClient } = require('@prisma/client');

async function clearOldDrafts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Clearing old drafts...');
    
    // Delete all drafts older than 1 hour
    const result = await prisma.draft.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    });
    
    console.log(`✅ Deleted ${result.count} old drafts`);
    
    // Also clear all drafts with old template format
    const oldFormatResult = await prisma.draft.deleteMany({
      where: {
        content: {
          contains: 'Sri. _____________ s/o'
        }
      }
    });
    
    console.log(`✅ Deleted ${oldFormatResult.count} old format drafts`);
    
  } catch (error) {
    console.error('❌ Error clearing drafts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOldDrafts();