const { PrismaClient } = require('@prisma/client')

async function checkUserPlan() {
  const prisma = new PrismaClient()
  
  try {
    // Check all users
    const users = await prisma.userApp.findMany({
      select: {
        email: true,
        plan: true,
        usageCount: true,
        expiryDate: true,
        createdAt: true
      }
    })
    
    console.log('All users in database:')
    console.table(users)
    
    // Check specific admin user
    const adminUser = await prisma.userApp.findFirst({
      where: {
        email: 'shivangibabbar0211@gmail.com'
      }
    })
    
    if (adminUser) {
      console.log('\nAdmin user found:')
      console.log(adminUser)
      
      if (adminUser.plan !== 'PRO') {
        console.log('\nUpdating admin user to PRO plan...')
        await prisma.userApp.update({
          where: { id: adminUser.id },
          data: { plan: 'PRO' }
        })
        console.log('Admin user updated to PRO plan!')
      }
    } else {
      console.log('\nAdmin user not found in database')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserPlan()