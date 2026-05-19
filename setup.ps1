# Hey App Setup Script
# Run this script from C:\Users\samir\Desktop\Hey in PowerShell

Write-Host "🚀 Setting up Hey messaging app..." -ForegroundColor Cyan

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --yes

# Install dependencies
npm install framer-motion zustand date-fns react-icons clsx tailwind-merge lucide-react

Write-Host "✅ Setup complete! Run 'npm run dev' to start." -ForegroundColor Green
