/**
 * Database Seed Script
 *
 * Seeds the database with initial token data.
 * Run with: npx tsx scripts/seed.ts
 */

import { seedTokens, ensureConnection, prisma } from '../lib/db/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  await ensureConnection();
  await seedTokens();

  console.log('✅ Seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
