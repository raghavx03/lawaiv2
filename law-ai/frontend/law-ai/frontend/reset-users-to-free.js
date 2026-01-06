#!/usr/bin/env node

// Script to reset all users to FREE plan except admin
const { PrismaClient } = require('@prisma/client')

async function resetUsersToFree() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Resetting all users to FREE plan...\n')
    
    // Get all users
    const users = await prisma.userApp.findMany({
      select: {
        userId: true,
        email: true,
        plan: true,
        usageCount: true
      }
    })
    
    console.log(`Found ${users.length} users in database:`)
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.plan} (${user.usageCount} queries)`)
    })
    
    // Reset all users to FREE except admin
    const adminEmail = 'shivangibabbar0211@gmail.com'
    
    const result = await prisma.userApp.updateMany({
      where: {
        email: {
          not: adminEmail
        }
      },
      data: {
        plan: 'FREE',
        usageCount: 0
      }
    })
    
    console.log(`\n✅ Updated ${result.count} users to FREE plan`)
    
    // Keep admin as PRO
    const adminResult = await prisma.userApp.updateMany({
      where: {
        email: adminEmail
      },
      data: {
        plan: 'PRO'
      }
    })
    
    if (adminResult.count > 0) {
      console.log(`✅ Kept admin (${adminEmail}) as PRO plan`)
    }
    
    // Show final state
    console.log('\n📊 Final user plans:')
    const finalUsers = await prisma.userApp.findMany({
      select: {
        email: true,
        plan: true,
        usageCount: true,
        createdAt: true
      }
    })
    
    finalUsers.forEach(user => {
      const daysSinceCreation = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const status = user.plan === 'FREE' && (daysSinceCreation > 7 || user.usageCount >= 10) ? '❌ EXPIRED' : '✅ ACTIVE'
      console.log(`  - ${user.email}: ${user.plan} (${user.usageCount}/10 queries, ${daysSinceCreation} days) ${status}`)
    })
    
    console.log('\n🎉 Reset completed successfully!')
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetUsersToFree()