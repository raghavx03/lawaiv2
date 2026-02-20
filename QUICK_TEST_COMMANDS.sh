#!/bin/bash

echo "🚀 LAW.AI - Quick Test Commands"
echo "================================"
echo ""

echo "1️⃣  Install Dependencies"
echo "npm install"
echo ""

echo "2️⃣  Start Development Server"
echo "npm run dev"
echo ""

echo "3️⃣  Test Auth Pages (in browser)"
echo "http://localhost:3000/auth/sign-in"
echo "http://localhost:3000/auth/sign-up"
echo ""

echo "4️⃣  Test Build"
echo "npm run build"
echo ""

echo "5️⃣  Test Production Server"
echo "npm run start"
echo ""

echo "6️⃣  Test API Endpoints"
echo ""
echo "Test AI Assistant:"
echo 'curl -X POST http://localhost:3000/api/ai-assistant \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"prompt": "Hello"}'"'"
echo ""

echo "Test Document Stats:"
echo "curl http://localhost:3000/api/documents/stats"
echo ""

echo "Test Case Law Search:"
echo 'curl -X POST http://localhost:3000/api/case-law/search \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"query": "Article 21", "type": "section"}'"'"
echo ""

echo "7️⃣  Deploy to GitHub"
echo "git add ."
echo 'git commit -m "Fix: Add dynamic rendering to auth pages"'
echo "git push origin main"
echo ""

echo "✅ All tests passed? Deploy to Vercel!"
echo ""

