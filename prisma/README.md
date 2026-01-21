# Database Migrations

## Migration History

### Initial Setup (SQLite → PostgreSQL)

The project was initially developed with SQLite for local development but is configured for PostgreSQL in production.

**Current Configuration**: PostgreSQL (Vercel Postgres)

### Existing Migrations

The `migrations/` folder contains SQLite migrations from initial development. When deploying to production with PostgreSQL:

1. These SQLite migrations will be ignored
2. You'll create fresh PostgreSQL migrations
3. The schema structure remains the same

## Creating Fresh PostgreSQL Migrations

### For Production Deployment

```bash
# 1. Ensure DATABASE_URL points to PostgreSQL
export DATABASE_URL="postgresql://..."

# 2. Remove old SQLite migration history (optional)
rm -rf prisma/migrations

# 3. Create fresh PostgreSQL migration
npx prisma migrate dev --name init

# 4. Or deploy directly to production
npx prisma migrate deploy
```

### Schema Overview

```prisma
- User: Wallet addresses
- Token: Token metadata (symbol, decimals, chain)
- TokenCapture: User's captured tokens with tx verification
- TokenPrice: Historical price data
```

## Local Development

### Option A: PostgreSQL (Recommended)

Use a local PostgreSQL instance or connect to Vercel Postgres:

```bash
# Get DATABASE_URL from Vercel
DATABASE_URL="postgresql://..." npx prisma migrate dev
```

### Option B: SQLite (Quick Testing)

For quick local testing without PostgreSQL:

```bash
# Temporarily change prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# Run migrations
npx prisma migrate dev

# Don't commit SQLite migrations!
```

## Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration (development)
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

## Troubleshooting

### "Provider mismatch" error

If you get provider mismatch errors:
1. Check `prisma/schema.prisma` has `provider = "postgresql"`
2. Ensure `DATABASE_URL` points to PostgreSQL
3. Regenerate client: `npx prisma generate`

### "Migration conflicts"

If migrations conflict between SQLite and PostgreSQL:
1. Backup any important data
2. Delete `prisma/migrations/` folder
3. Create fresh migration: `npx prisma migrate dev --name init`

### Connection pooling issues

Use Vercel's `POSTGRES_PRISMA_URL` instead of `DATABASE_URL` for better connection pooling.
