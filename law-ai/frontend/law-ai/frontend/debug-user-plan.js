const { PrismaClient } = require('@prisma/client')

async function checkUserPlan() {
  const prisma = new PrismaClient()
  
  try {
    // Get all users and their plans
    const users = await prisma.userApp.findMany({
      select: {
        userId: true,
        plan: true,
        createdAt: true
      }
    })
    
    console.log('All users and their plans:')
    users.forEach(user => {
      console.log(`User ID: ${user.userId}, Plan: ${user.plan}, Created: ${user.createdAt}`)
    })
    
    // Check if any user has FREE plan
    const freeUsers = users.filter(u => u.plan === 'FREE')
    console.log(`\nFREE plan users: ${freeUsers.length}`)
    
    // If no FREE users, set the first user to FREE
    if (users.length > 0 && freeUsers.length === 0) {
      const firstUser = users[0]
      await prisma.userApp.update({
        where: { userId: firstUser.userId },
        data: { plan: 'FREE' }
      })
      console.log(`Updated user ${firstUser.userId} to FREE plan`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserPlan()