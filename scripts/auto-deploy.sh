#!/bin/bash
set -e

echo "🚀 LAW-AI Automated Production Launch"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN=${1:-"lawai.example.com"}
echo -e "${GREEN}🌐 Deploying to: $DOMAIN${NC}"

# 1. Environment Setup
echo -e "\n${YELLOW}🔧 Setting up production environment...${NC}"
cat > .env.production << EOF
# LAW-AI Production Environment
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://$DOMAIN

# Database
DATABASE_URL=\${DATABASE_URL}
DIRECT_URL=\${DIRECT_URL}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}

# OpenAI
OPENAI_API_KEY=\${OPENAI_API_KEY}

# Razorpay (LIVE)
NEXT_PUBLIC_RAZORPAY_KEY_ID=\${NEXT_PUBLIC_RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=\${RAZORPAY_KEY_SECRET}
RAZORPAY_WEBHOOK_SECRET=\${RAZORPAY_WEBHOOK_SECRET}

# Security
CSRF_SECRET=\${CSRF_SECRET}
JWT_SECRET=\${JWT_SECRET}
EOF

# 2. Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# 3. Generate Prisma client
echo -e "\n${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# 4. Build application
echo -e "\n${YELLOW}🏗️  Building application...${NC}"
npm run build

# 5. Create Docker image
echo -e "\n${YELLOW}🐳 Building Docker image...${NC}"
docker build -f Dockerfile.production -t law-ai:latest .

# 6. Deploy with Docker Compose
echo -e "\n${YELLOW}🚀 Deploying to production...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# 7. Wait for services
echo -e "\n${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# 8. Run health check
echo -e "\n${YELLOW}🏥 Running health check...${NC}"
curl -f http://localhost:3000/api/health || echo "Health check failed"

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🎉 LAW-AI is now live at: https://$DOMAIN${NC}"