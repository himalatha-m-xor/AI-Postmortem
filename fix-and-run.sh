#!/bin/bash

# ARIA - Fix and Run Script
# This script cleans the cache and starts the dev server

echo "🔧 ARIA - Cleaning and Starting..."
echo ""

# Navigate to project directory
cd /home/himah/Postmortem

# Clean Next.js cache
echo "📦 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Cache cleaned!"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  WARNING: .env.local not found!"
    echo "Creating from template..."
    cp .env.local.example .env.local
    echo ""
    echo "📝 Please edit .env.local and add your OpenAI API key:"
    echo "   nano .env.local"
    echo ""
    echo "Then run: npm run dev"
    exit 1
fi

# Start the dev server
echo "🚀 Starting ARIA..."
echo ""
npm run dev
