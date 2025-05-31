#!/bin/bash
# Quick dependency update script for showcase project
# Run this every few months to keep dependencies fresh

echo "🔄 Updating all dependencies..."

echo ""
echo "📦 Root directory..."
npm update

echo ""
echo "📦 Admin server..."
cd admin/server && npm update && cd ../..

echo ""
echo "📦 Admin client..."
cd admin/client && npm update && cd ../..

echo ""
echo "📦 Backend..."
cd backend && npm update && cd ..

echo ""
echo "✅ All dependencies updated!"
echo ""
echo "💡 Tip: Run 'npm audit' to check for vulnerabilities"
