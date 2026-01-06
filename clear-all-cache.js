// Clear all cached data completely
const { PrismaClient } = require('@prisma/client');

async function clearAllCache() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Clearing ALL cached data...');
    
    // Delete ALL drafts
    const result = await prisma.draft.deleteMany({});
    console.log(`✅ Deleted ${result.count} drafts`);
    
    console.log('🔥 All cache cleared! Fresh start guaranteed.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllCache();