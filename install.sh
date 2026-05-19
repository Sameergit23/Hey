#!/bin/bash

# Hey - Automated Installation Script
# This script sets up the entire Hey messaging platform

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║   🚀 Hey - Realtime Messaging Platform        ║"
echo "║   Automated Installation Script               ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker is not installed${NC}"
    echo "Docker is recommended for running PostgreSQL and Redis"
    echo "You can install it from https://www.docker.com"
    echo ""
    read -p "Continue without Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  Step 1: Installing Dependencies"
echo "═══════════════════════════════════════════════"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "═══════════════════════════════════════════════"
echo "  Step 2: Setting up Environment"
echo "═══════════════════════════════════════════════"
echo ""

# Setup frontend environment
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend .env.local..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ Frontend environment created${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env.local already exists${NC}"
fi

# Setup backend environment
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Backend environment created${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Edit backend/.env with your credentials${NC}"
    echo "   - Set strong JWT secrets (min 32 characters)"
    echo "   - Configure Cloudinary credentials"
    echo "   - Configure Twilio for production OTP"
else
    echo -e "${YELLOW}⚠ Backend .env already exists${NC}"
fi

echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "═══════════════════════════════════════════════"
    echo "  Step 3: Starting Database Services"
    echo "═══════════════════════════════════════════════"
    echo ""
    
    read -p "Start PostgreSQL and Redis with Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Starting Docker services..."
        cd backend
        docker-compose up -d
        cd ..
        
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        
        echo -e "${GREEN}✓ Database services started${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  Step 4: Database Setup"
echo "═══════════════════════════════════════════════"
echo ""

read -p "Run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Generating Prisma client..."
    cd backend
    npm run db:generate
    
    echo "🗄️  Running database migrations..."
    npm run db:migrate
    cd ..
    
    echo -e "${GREEN}✓ Database setup complete${NC}"
fi

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║   ✅ Installation Complete!                   ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit backend/.env with your credentials:"
echo "   - JWT secrets (min 32 characters)"
echo "   - Cloudinary credentials"
echo "   - Twilio credentials (for production)"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   - QUICK_START.md"
echo "   - backend/SETUP_GUIDE.md"
echo ""
echo "🎉 Happy messaging!"
echo ""
