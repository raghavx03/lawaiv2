#!/bin/bash

echo "🚀 Starting LAW-AI Production Server..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please copy .env.example to .env.local and configure your environment variables."
    exit 1
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Test database connection
echo "🔄 Testing database connection..."
node scripts/setup-database.js

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed!"
    exit 1
fi

# Build the application
echo "🔄 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Start the server
echo "✅ Starting production server..."
npm start