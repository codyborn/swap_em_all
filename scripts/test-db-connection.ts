/**
 * Database Connection Test
 *
 * Tests the PostgreSQL connection without running migrations.
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test 1: Basic connection
    console.log('1️⃣  Testing basic connection...');
    await prisma.$connect();
    console.log('   ✅ Connected to database\n');

    // Test 2: Query database version
    console.log('2️⃣  Checking database version...');
    const result: any = await prisma.$queryRaw`SELECT version()`;
    console.log(`   📊 Database: ${result[0].version.split(' ').slice(0, 2).join(' ')}\n`);

    // Test 3: Check if tables exist
    console.log('3️⃣  Checking for tables...');
    const tables: any = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('   ⚠️  No tables found - migrations need to be run\n');
      console.log('   Run: npx prisma db push\n');
    } else {
      console.log(`   ✅ Found ${tables.length} tables:`);
      tables.forEach((table: any) => {
        console.log(`      - ${table.table_name}`);
      });
      console.log('');
    }

    // Test 4: Try to query a table if it exists
    const hasUserTable = tables.some((t: any) => t.table_name === 'User');
    if (hasUserTable) {
      console.log('4️⃣  Testing query on User table...');
      const userCount = await prisma.user.count();
      console.log(`   ✅ User count: ${userCount}\n`);

      const hasTokenTable = tables.some((t: any) => t.table_name === 'Token');
      if (hasTokenTable) {
        console.log('5️⃣  Testing query on Token table...');
        const tokenCount = await prisma.token.count();
        console.log(`   ✅ Token count: ${tokenCount}\n`);
      }
    }

    console.log('✅ All connection tests passed!\n');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:\n');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}\n`);

      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('   💡 Tip: Check that DATABASE_URL is correct and database is accessible\n');
      } else if (error.message.includes('authentication')) {
        console.error('   💡 Tip: Check database credentials in DATABASE_URL\n');
      } else if (error.message.includes('does not exist')) {
        console.error('   💡 Tip: Run migrations with: npx prisma db push\n');
      }
    } else {
      console.error(error);
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
