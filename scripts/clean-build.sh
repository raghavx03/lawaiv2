#!/bin/bash
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf *.tsbuildinfo
rm -rf .vercel
echo "✅ Build cache cleaned"