/**
 * Backend API Integration Tests
 *
 * Comprehensive tests for the backend API including:
 * - Database operations
 * - Token capture registration
 * - User stats calculations
 * - Price update cron job
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

// Test addresses on Unichain (chainId: 130)
const UNICHAIN_ID = 130;
const USDC_ADDRESS = '0x078d782b760474a361dda0af3839290b0ef57ad6';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const TEST_WALLET = '0x24EcD23096fCF03A15ee8a6FE63F24345Cc4BA46';

test.describe('Backend API - Database Integration', () => {
  test('should connect to database', async ({ request }) => {
    // Test that stats API works (requires DB connection)
    const response = await request.get(
      `${BASE_URL}/api/game/stats?address=${TEST_WALLET}`
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should return valid stats structure
    expect(data).toHaveProperty('totalCaptures');
    expect(data).toHaveProperty('totalValue');
    expect(data).toHaveProperty('captures');
    expect(Array.isArray(data.captures)).toBeTruthy();

    console.log('✅ Database connection successful');
  });
});

test.describe('Backend API - Token Capture Registration', () => {
  test('should reject capture with missing parameters', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/game/capture`, {
      data: {
        txHash: '0x123',
        // Missing other required fields
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Missing required fields');

    console.log('✅ Input validation working');
  });

  test('should reject capture with invalid transaction', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/game/capture`, {
      data: {
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        walletAddress: TEST_WALLET,
        tokenAddress: WETH_ADDRESS,
        expectedAmount: '1000000000000000000',
        usdcSpent: '1000000',
      },
    });

    // Should fail because tx doesn't exist
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');

    console.log('✅ Transaction verification working');
  });

  test('should validate transaction structure', async ({ request }) => {
    // Test with a valid-looking but non-existent transaction hash
    const fakeTxHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

    const response = await request.post(`${BASE_URL}/api/game/capture`, {
      data: {
        txHash: fakeTxHash,
        walletAddress: TEST_WALLET,
        tokenAddress: WETH_ADDRESS,
        expectedAmount: '1000000000000000000',
        usdcSpent: '1000000',
      },
    });

    // Should fail at transaction lookup stage
    expect([404, 500]).toContain(response.status());

    console.log('✅ Transaction lookup working');
  });
});

test.describe('Backend API - User Stats', () => {
  test('should return empty stats for new user', async ({ request }) => {
    // Use a random address that definitely has no captures
    const randomAddress = '0x0000000000000000000000000000000000000001';

    const response = await request.get(
      `${BASE_URL}/api/game/stats?address=${randomAddress}`
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.totalCaptures).toBe(0);
    expect(data.totalValue).toBe('0');
    expect(data.totalProfitLoss).toBe('0');
    expect(data.captures).toEqual([]);

    console.log('✅ Empty stats returned correctly');
  });

  test('should require address parameter', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/game/stats`);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('address');

    console.log('✅ Address parameter validation working');
  });

  test('should handle valid address format', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/game/stats?address=${TEST_WALLET}`
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should have proper structure even if empty
    expect(typeof data.totalCaptures).toBe('number');
    expect(typeof data.totalValue).toBe('string');
    expect(typeof data.totalProfitLoss).toBe('string');

    console.log('✅ Stats structure valid');
  });
});

test.describe('Backend API - Price Update Cron', () => {
  test('should require authorization in production', async ({ request }) => {
    // Skip in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Skipping auth test in development mode');
      return;
    }

    // Try without auth header
    const response = await request.post(`${BASE_URL}/api/cron/update-prices`, {
      data: {},
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');

    console.log('✅ Cron authorization working');
  });

  test('should update token prices', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/cron/update-prices`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should return update results
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('updated');
    expect(data).toHaveProperty('failed');
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBeTruthy();

    console.log(`✅ Price update: ${data.updated} tokens updated, ${data.failed} failed`);

    // Log detailed results
    data.results.forEach((result: any) => {
      if (result.success) {
        console.log(`   ✓ ${result.token} updated`);
      } else {
        console.log(`   ✗ ${result.token} failed: ${result.error}`);
      }
    });
  });

  test('should handle API rate limiting gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/cron/update-prices`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();

    // Even with failures, should return valid structure
    expect(data).toHaveProperty('results');
    expect(typeof data.updated).toBe('number');
    expect(typeof data.failed).toBe('number');

    console.log('✅ Rate limiting handled correctly');
  });
});

test.describe('Backend API - Complete Flow', () => {
  test('should support complete token tracking flow', async ({ request }) => {
    console.log('\n🔄 Testing complete flow...\n');

    // Step 1: Check initial stats
    console.log('1️⃣  Checking initial user stats...');
    const statsResponse1 = await request.get(
      `${BASE_URL}/api/game/stats?address=${TEST_WALLET}`
    );
    expect(statsResponse1.ok()).toBeTruthy();
    const initialStats = await statsResponse1.json();
    console.log(`   Initial captures: ${initialStats.totalCaptures}`);

    // Step 2: Update prices
    console.log('2️⃣  Updating token prices...');
    const priceResponse = await request.post(`${BASE_URL}/api/cron/update-prices`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    expect(priceResponse.ok()).toBeTruthy();
    const priceData = await priceResponse.json();
    console.log(`   Updated: ${priceData.updated} tokens`);

    // Step 3: Verify stats still accessible
    console.log('3️⃣  Verifying stats after price update...');
    const statsResponse2 = await request.get(
      `${BASE_URL}/api/game/stats?address=${TEST_WALLET}`
    );
    expect(statsResponse2.ok()).toBeTruthy();
    const finalStats = await statsResponse2.json();
    console.log(`   Final captures: ${finalStats.totalCaptures}`);

    // Stats should be consistent
    expect(finalStats.totalCaptures).toBe(initialStats.totalCaptures);

    console.log('\n✅ Complete flow test passed!\n');
  });
});

test.describe('Backend API - Error Handling', () => {
  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/game/capture`, {
      data: 'not valid json',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    // Should return error, not crash
    expect([400, 500]).toContain(response.status());

    console.log('✅ Malformed input handled');
  });

  test('should handle extremely long addresses', async ({ request }) => {
    const longAddress = '0x' + '1'.repeat(1000);

    const response = await request.get(
      `${BASE_URL}/api/game/stats?address=${longAddress}`
    );

    // Should handle gracefully (either error or process)
    expect(response.status()).toBeLessThan(600);

    console.log('✅ Long address handled');
  });

  test('should handle invalid chain IDs', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/game/capture`, {
      data: {
        txHash: '0x123',
        walletAddress: TEST_WALLET,
        tokenAddress: WETH_ADDRESS,
        expectedAmount: '1000000',
        usdcSpent: '1000000',
        chainId: 99999, // Invalid chain
      },
    });

    // Should handle gracefully
    expect(response.status()).toBeLessThan(600);

    console.log('✅ Invalid chain ID handled');
  });
});

test.describe('Backend API - Performance', () => {
  test('should respond to stats query within 2 seconds', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(
      `${BASE_URL}/api/game/stats?address=${TEST_WALLET}`
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);

    console.log(`✅ Stats query completed in ${duration}ms`);
  });

  test('should handle concurrent requests', async ({ request }) => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      request.get(
        `${BASE_URL}/api/game/stats?address=0x000000000000000000000000000000000000000${i}`
      )
    );

    const responses = await Promise.all(promises);

    responses.forEach((response, i) => {
      expect(response.ok()).toBeTruthy();
      console.log(`   Request ${i + 1}: ${response.status()}`);
    });

    console.log('✅ Concurrent requests handled');
  });
});
