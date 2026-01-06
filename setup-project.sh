#!/bin/bash

# LAW-AI Project Setup Script
echo "🚀 Setting up LAW-AI project..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Copy fixed environment file
if [ -f ".env.local.fixed" ]; then
    echo "📋 Copying fixed environment configuration..."
    cp .env.local.fixed .env.local
    echo "⚠️  IMPORTANT: Update .env.local with your real API keys!"
else
    echo "⚠️  Warning: .env.local.fixed not found. Using existing .env.local"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate || { echo "❌ Prisma generation failed"; exit 1; }

# Push database schema (for development)
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss || { echo "❌ Database schema push failed"; exit 1; }

# Build the project
echo "🏗️  Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env.local with your real API keys:"
echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)"
echo "   - OPENAI_API_KEY (from OpenAI dashboard)"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"