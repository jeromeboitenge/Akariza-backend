#!/bin/bash

echo "🚀 Akariza Backend - Quick Setup & Error Fix"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one from .env.example"
    echo "   cp .env.example .env"
    echo "   Then edit .env with your database URL"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
echo "   (Make sure PostgreSQL is running and DATABASE_URL is correct in .env)"
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "⚠️  Migration failed. Please check:"
    echo "   1. PostgreSQL is running"
    echo "   2. DATABASE_URL in .env is correct"
    echo "   3. Database exists"
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Try to build
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

echo "✅ Build successful"
echo ""

echo "🎉 Setup complete! You can now:"
echo "   1. Start development server: npm run start:dev"
echo "   2. View database: npx prisma studio"
echo ""
