#!/usr/bin/env node

// Test script to verify plan detection fix
const { PrismaClient } = require('@prisma/client')

async function testPlanFix() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing Plan Detection Fix...\n')
    
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')
    
    // Test 2: Check existing users and their plans
    console.log('2. Checking existing users and plans...')
    const users = await prisma.userApp.findMany({
      select: {
        userId: true,
        email: true,
        plan: true,
        usageCount: true,
        createdAt: true
      }
    })
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database')
    } else {
      console.log(`Found ${users.length} users:`)
      users.forEach(user => {
        const daysSinceCreation = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        const isExpired = user.plan === 'FREE' && (daysSinceCreation > 7 || user.usageCount >= 10)
        
        console.log(`  - ${user.email}`)
        console.log(`    Plan: ${user.plan}`)
        console.log(`    Usage: ${user.usageCount}/10 queries`)
        console.log(`    Days since creation: ${daysSinceCreation}`)
        console.log(`    Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`)
        console.log('')
      })
    }
    
    // Test 3: Test feature access logic
    console.log('3. Testing feature access logic...')
    const { hasFeatureAccess } = require('./src/lib/feature-access')
    
    const testCases = [
      { plan: 'FREE', feature: 'AI_ASSISTANT', expected: true },
      { plan: 'FREE', feature: 'CASE_TRACKER', expected: false },
      { plan: 'EXPIRED_FREE', feature: 'AI_ASSISTANT', expected: false },
      { plan: 'PRO', feature: 'CASE_TRACKER', expected: true },
    ]
    
    testCases.forEach(test => {
      const result = hasFeatureAccess(test.plan, test.feature)
      const status = result === test.expected ? '✅' : '❌'
      console.log(`  ${status} ${test.plan} -> ${test.feature}: ${result} (expected: ${test.expected})`)
    })
    
    console.log('\n🎉 Plan detection fix test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testPlanFix()