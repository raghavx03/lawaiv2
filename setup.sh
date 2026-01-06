#!/bin/bash

echo "🚀 LAW-AI Project Setup & Fix Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Navigate to frontend directory
cd "law-ai/frontend" || exit 1

# Install dependencies
print_status "Installing dependencies..."
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Check environment variables
if [ ! -f ".env.local" ]; then
    print_warning "No .env.local found. Please copy from .env.example and configure."
    cp .env.example .env.local
fi

# Test database connection
print_status "Testing database connection..."
if npx prisma db pull --print > /dev/null 2>&1; then
    print_status "Database connection successful"
else
    print_warning "Database connection failed. Please check your DATABASE_URL"
fi

# Run database migration
print_status "Running database migrations..."
npx prisma db push

# Build the project
print_status "Building the project..."
npm run build

print_status "Setup completed! You can now run:"
echo "  cd law-ai/frontend"
echo "  npm run dev"

echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run lint         - Run ESLint"
echo ""
echo "📊 Test the application:"
echo "  Frontend: http://localhost:3000"
echo "  Health Check: http://localhost:3000/api/health"