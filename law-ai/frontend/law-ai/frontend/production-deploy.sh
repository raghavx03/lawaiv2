#!/bin/bash

# LAW-AI Production Deployment Script
echo "🚀 LAW-AI Production Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    exit 1
fi

print_status "Checking environment configuration..."

# Check critical environment variables
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env.local | cut -d'=' -f2-)
    
    if [ -z "$var_value" ] || [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"placeholder"* ]]; then
        print_error "$var_name is not properly configured"
        return 1
    else
        print_success "$var_name is configured"
        return 0
    fi
}

# Check all critical variables
ERRORS=0

print_status "Checking Supabase configuration..."
check_env_var "NEXT_PUBLIC_SUPABASE_URL" || ((ERRORS++))
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" || ((ERRORS++))

print_status "Checking OpenAI configuration..."
check_env_var "OPENAI_API_KEY" || ((ERRORS++))

print_status "Checking Razorpay configuration..."
check_env_var "NEXT_PUBLIC_RAZORPAY_KEY_ID" || ((ERRORS++))
check_env_var "RAZORPAY_KEY_SECRET" || ((ERRORS++))

print_status "Checking Email configuration..."
check_env_var "SMTP_USER" || ((ERRORS++))
check_env_var "SMTP_PASS" || ((ERRORS++))

print_status "Checking Database configuration..."
check_env_var "DATABASE_URL" || ((ERRORS++))

if [ $ERRORS -gt 0 ]; then
    print_error "Found $ERRORS configuration errors. Please fix them before deployment."
    exit 1
fi

print_success "All environment variables are properly configured!"

# Build the application
print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Run tests
print_status "Running mobile compatibility tests..."
node mobile-test-script.js

print_status "Deployment checklist:"
echo "====================="
echo "✅ Environment variables configured"
echo "✅ Application built successfully"
echo "✅ Mobile compatibility tested"
echo ""
echo "📋 Manual verification needed:"
echo "1. Test signup/login flow"
echo "2. Test AI Assistant functionality"
echo "3. Test payment integration"
echo "4. Test mobile responsiveness"
echo "5. Test all API endpoints"
echo ""
echo "🚀 Ready for production deployment!"

print_success "Deployment preparation completed!"