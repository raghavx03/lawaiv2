
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing Database Connection...')
        const userCount = await prisma.userApp.count()
        console.log(`✅ Connection Successful! Found ${userCount} users.`)

        // Check for other entities if they exist, to ensure schema is pushed
        // We'll wrap these in try-catch in case the table is empty or specific logic fails
        try {
            const fileCount = await prisma.uploadedFile.count()
            console.log(`✅ UploadedFiles table exists. Found ${fileCount} files.`)
        } catch (e) {
            console.log('⚠️ Could not query UploadedFile table (might be empty or missing).')
        }

    } catch (e) {
        console.error('❌ Database Connection Failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
