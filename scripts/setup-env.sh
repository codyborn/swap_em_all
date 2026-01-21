#!/bin/bash

# Setup Environment Script
# Helps configure .env.local for development

echo "🔧 Setting up .env.local for PostgreSQL..."
echo ""
echo "Please paste your POSTGRES_PRISMA_URL from Vercel:"
echo "(Find it in: Vercel Dashboard → Storage → Postgres → .env.local tab)"
echo ""
read -r DATABASE_URL

if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
  echo ""
  echo "❌ Error: URL must start with postgresql://"
  echo "   You provided: ${DATABASE_URL:0:50}..."
  exit 1
fi

# Create backup
if [ -f .env.local ]; then
  cp .env.local .env.local.backup
  echo "✅ Backed up existing .env.local to .env.local.backup"
fi

# Create new .env.local with properly formatted DATABASE_URL
cat > .env.local << EOF
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:-}

# Uniswap Trading API Key
UNISWAP_API_KEY=${UNISWAP_API_KEY:-}

# Cron Security
CRON_SECRET=${CRON_SECRET:-}

# Database (PostgreSQL from Vercel)
DATABASE_URL="$DATABASE_URL"

# Environment
NODE_ENV=development
EOF

echo ""
echo "✅ .env.local updated successfully!"
echo ""
echo "Next steps:"
echo "  1. Fill in missing values: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, UNISWAP_API_KEY, CRON_SECRET"
echo "  2. Test connection: npx tsx scripts/test-db-connection.ts"
echo "  3. Push schema: npx prisma db push"
echo "  4. Seed database: npx tsx scripts/seed.ts"
