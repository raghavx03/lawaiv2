
// Script to enable pgvector extension
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Enabling pgvector extension...')
    try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`
        console.log('Successfully enabled vector extension!')
    } catch (error) {
        console.error('Error enabling vector extension:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
