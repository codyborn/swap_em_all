# Deployment Guide - Vercel + Vercel Postgres

This guide walks through deploying Swap 'Em All to Vercel with Vercel Postgres.

## Prerequisites

- GitHub repository with latest code
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Uniswap Trading API key
- WalletConnect Project ID

---

## Step 1: Deploy to Vercel

### 1.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your GitHub repository (`swap_em_all`)
3. Click "Import"

### 1.2 Configure Project

**Framework Preset**: Next.js (should auto-detect)

**Environment Variables** - Add these:

```bash
# WalletConnect (required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Uniswap Trading API (required)
UNISWAP_API_KEY=your_uniswap_api_key

# Cron Security (required)
CRON_SECRET=generate_a_random_secret_here

# Database (will be auto-set after Step 2)
# DATABASE_URL=<leave blank for now>
```

To generate a secure `CRON_SECRET`:
```bash
openssl rand -hex 32
```

### 1.3 Deploy

Click "Deploy" and wait for the initial deployment to complete.

**Note**: First deployment will fail database connection - that's expected. We'll fix this in Step 2.

---

## Step 2: Create Vercel Postgres Database

### 2.1 Create Database

1. Go to your project in Vercel dashboard
2. Click the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Click "Create"

This automatically:
- ✅ Creates a PostgreSQL database
- ✅ Configures connection pooling
- ✅ Sets `DATABASE_URL` environment variable
- ✅ Adds other Postgres env vars (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.)

### 2.2 Use the Correct Connection String

Vercel creates multiple Postgres connection strings. For Prisma, use:

**`POSTGRES_PRISMA_URL`** - This is the connection pooling URL optimized for Prisma.

Make sure your `DATABASE_URL` environment variable is set to `POSTGRES_PRISMA_URL` value, or just use `POSTGRES_PRISMA_URL` directly in your Prisma configuration.

---

## Step 3: Run Database Migrations

### 3.1 Connect Locally (Optional for Testing)

To test locally before deploying:

1. Copy the `DATABASE_URL` from Vercel Storage tab
2. Add to your local `.env.local`:
   ```bash
   DATABASE_URL="postgres://..."
   ```
3. Run migrations locally:
   ```bash
   npx prisma migrate dev --name init
   ```

### 3.2 Deploy Migrations to Production

**Option A: Via Vercel CLI** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env

# Run migrations
npx prisma migrate deploy

# Seed the database
npx tsx scripts/seed.ts
```

**Option B: Via Build Script**

Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Then redeploy in Vercel (it will run migrations automatically).

**Option C: Via Vercel Web Terminal**

1. Go to your project → Settings → Functions
2. Enable "Web Terminal" (if available)
3. Run commands directly in production environment

---

## Step 4: Verify Deployment

### 4.1 Check Database Connection

Visit your deployment URL:
```
https://your-project.vercel.app/api/game/stats?address=0x0000000000000000000000000000000000000000
```

Should return:
```json
{
  "totalCaptures": 0,
  "totalValue": "0",
  "totalProfitLoss": "0",
  "captures": []
}
```

### 4.2 Test Cron Job

The cron job runs automatically every minute. Check logs:

1. Go to Vercel dashboard → Your project
2. Click "Logs" tab
3. Filter by `/api/cron/update-prices`
4. Should see successful price updates

Or test manually:
```bash
curl -X POST https://your-project.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4.3 Verify All APIs

```bash
# Health check (stats with empty address)
curl "https://your-project.vercel.app/api/game/stats?address=0x0000000000000000000000000000000000000000"

# Price update (requires CRON_SECRET)
curl -X POST https://your-project.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Swap quote
curl -X POST https://your-project.vercel.app/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "swapper": "0x0000000000000000000000000000000000000001",
    "tokenIn": "0x078d782b760474a361dda0af3839290b0ef57ad6",
    "tokenOut": "0x4200000000000000000000000000000000000006",
    "amount": "1000000",
    "chainId": 130,
    "type": "EXACT_INPUT",
    "slippage": 0.5
  }'
```

---

## Step 5: Monitor & Maintain

### Database Management

**View Data**:
```bash
# Install Prisma Studio
npm install -D @prisma/studio

# Open database browser
npx prisma studio
```

**Check Storage Usage**:
- Go to Vercel Dashboard → Storage → Your Database
- Monitor usage against free tier limits (256 MB)

**Backup** (if needed):
```bash
# Export data
npx prisma db pull

# Or use Vercel's backup features (available on Pro plan)
```

### Cron Job Monitoring

Vercel provides cron logs automatically:
1. Dashboard → Your Project → Logs
2. Filter by `cron` or `/api/cron/update-prices`
3. Check for errors or rate limiting

### Upgrade Database (If Needed)

If you exceed free tier limits:
1. Go to Storage → Your Database → Settings
2. Upgrade to Pro ($20/month for more storage)

Or switch to external PostgreSQL:
1. Use [Supabase](https://supabase.com) (500 MB free)
2. Use [Neon](https://neon.tech) (3 GB free)
3. Update `DATABASE_URL` in Vercel

---

## Troubleshooting

### Migration Errors

**Error**: `P1001: Can't reach database server`
- **Fix**: Check `DATABASE_URL` is set correctly in Vercel
- **Fix**: Ensure database is created in Storage tab

**Error**: `Migration failed to apply`
- **Fix**: Delete old SQLite migrations: `rm -rf prisma/migrations`
- **Fix**: Create fresh migration: `npx prisma migrate dev --name init`

### Cron Job Not Running

**Error**: Cron job doesn't execute
- **Fix**: Ensure `vercel.json` is in root directory
- **Fix**: Redeploy after adding `vercel.json`
- **Fix**: Check Vercel logs for cron execution

**Error**: `Unauthorized` on cron endpoint
- **Fix**: Ensure `CRON_SECRET` environment variable is set
- **Fix**: Vercel Cron automatically includes auth header

### Database Connection Pooling

**Error**: `Too many connections`
- **Fix**: Use `POSTGRES_PRISMA_URL` instead of `DATABASE_URL`
- **Fix**: Prisma automatically handles connection pooling

---

## Environment Variables Checklist

Make sure all these are set in Vercel:

- ✅ `DATABASE_URL` or `POSTGRES_PRISMA_URL` (auto-set by Vercel Postgres)
- ✅ `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- ✅ `UNISWAP_API_KEY`
- ✅ `CRON_SECRET`
- ✅ `NODE_ENV=production` (auto-set by Vercel)

---

## Security Checklist

Before going live:

- ✅ Generate strong `CRON_SECRET`
- ✅ Keep API keys in environment variables (never in code)
- ✅ Enable Vercel's DDoS protection
- ✅ Consider adding rate limiting to API routes
- ✅ Review Vercel's security best practices

---

## Cost Estimate

**Free Tier (Good for MVP):**
- Vercel Hobby: Free
- Vercel Postgres: Free (256 MB, 60 compute hours/month)
- Estimated users: ~100-500 captures before hitting limits

**Paid Tier (If Scaling):**
- Vercel Pro: $20/month (team features, analytics)
- Postgres Pro: Included in Vercel Pro (1 GB storage)
- External DB: Supabase Pro $25/month (8 GB)

---

## Next Steps After Deployment

1. **Test token capture flow** with a real transaction
2. **Monitor cron job logs** for price updates
3. **Check database growth** in Vercel dashboard
4. **Add error monitoring** (Sentry, etc.)
5. **Set up analytics** to track usage

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Prisma Docs: https://www.prisma.io/docs
- Project Issues: https://github.com/codyborn/swap_em_all/issues
