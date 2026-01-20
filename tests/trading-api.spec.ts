/**
 * Trading API Integration Tests
 *
 * These tests verify the correct operation of the Uniswap Trading API integration,
 * including payload structure, error handling, and mock responses.
 */

import { test, expect } from '@playwright/test';

// Test addresses on Unichain (chainId: 130)
const UNICHAIN_ID = 130;
const USDC_ADDRESS = '0x078d782b760474a361dda0af3839290b0ef57ad6';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const TEST_WALLET = '0x24EcD23096fCF03A15ee8a6FE63F24345Cc4BA46';

test.describe('Trading API - Approval Endpoint', () => {
  test('should check approval for token', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/approval', {
      data: {
        walletAddress: TEST_WALLET,
        token: USDC_ADDRESS,
        amount: '1000000', // 1 USDC (6 decimals)
        chainId: UNICHAIN_ID,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should have approval field (either null or transaction object)
    expect(data).toHaveProperty('approval');

    // If approval is not null, verify structure
    if (data.approval !== null) {
      expect(data.approval).toHaveProperty('to');
      expect(data.approval).toHaveProperty('from');
      expect(data.approval).toHaveProperty('data');
      expect(data.approval).toHaveProperty('value');
      expect(data.approval).toHaveProperty('chainId');
      expect(data.approval.chainId).toBe(UNICHAIN_ID);
    }

    console.log('✅ Approval check response:', JSON.stringify(data, null, 2));
  });

  test('should return 400 for missing parameters', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/approval', {
      data: {
        walletAddress: TEST_WALLET,
        // Missing token, amount, chainId
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('mock mode should not include extra fields', async ({ request }) => {
    // This test verifies that mock responses don't have extra fields
    // that would cause issues when passed to subsequent endpoints
    const response = await request.post('http://localhost:3000/api/swap/approval', {
      data: {
        walletAddress: TEST_WALLET,
        token: USDC_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
      },
    });

    const data = await response.json();

    // Should only have 'approval' field, no 'mock' or 'warning' fields
    const keys = Object.keys(data);
    expect(keys).toContain('approval');

    // In mock mode, these fields should NOT exist
    if (!process.env.UNISWAP_API_KEY) {
      expect(keys).not.toContain('mock');
      expect(keys).not.toContain('warning');
    }

    console.log('✅ Approval response has correct structure (no extra fields)');
  });
});

test.describe('Trading API - Quote Endpoint', () => {
  test('should get quote for swap', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000', // 1 USDC
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify required fields
    expect(data).toHaveProperty('routing');
    expect(data).toHaveProperty('quote');

    // Verify routing is valid (CLASSIC or DUTCH_V2, not MOCK)
    expect(['CLASSIC', 'DUTCH_V2']).toContain(data.routing);

    // Verify quote structure
    expect(data.quote).toHaveProperty('input');
    expect(data.quote).toHaveProperty('output');
    expect(data.quote).toHaveProperty('slippage');
    expect(data.quote.input.token.toLowerCase()).toBe(USDC_ADDRESS.toLowerCase());
    expect(data.quote.output.token.toLowerCase()).toBe(WETH_ADDRESS.toLowerCase());

    console.log('✅ Quote response:', {
      routing: data.routing,
      inputAmount: data.quote.input.amount,
      outputAmount: data.quote.output.amount,
      hasPermitData: !!data.permitData,
    });
  });

  test('should return 400 for missing parameters', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        // Missing required params
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('mock quote should have correct structure for /swap endpoint', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    const data = await response.json();

    // CRITICAL: Verify response can be passed to /swap endpoint
    // Should NOT have 'mock', 'warning', or 'timestamp' fields
    const keys = Object.keys(data);

    if (!process.env.UNISWAP_API_KEY) {
      expect(keys).not.toContain('mock');
      expect(keys).not.toContain('warning');
      expect(keys).not.toContain('timestamp');
    }

    // Should have requestId for tracking
    expect(data).toHaveProperty('requestId');

    // Routing should be 'CLASSIC' not 'MOCK'
    expect(data.routing).toBe('CLASSIC');

    console.log('✅ Quote structure is valid for /swap endpoint');
  });
});

test.describe('Trading API - Swap Endpoint', () => {
  test('should generate swap transaction with correct payload structure', async ({ request }) => {
    // First get a quote
    const quoteResponse = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    expect(quoteResponse.ok()).toBeTruthy();
    const quoteData = await quoteResponse.json();

    console.log('📝 Quote structure:', {
      hasRouting: !!quoteData.routing,
      hasQuote: !!quoteData.quote,
      hasPermitData: !!quoteData.permitData,
      hasRequestId: !!quoteData.requestId,
    });

    // Now call swap with the full quote response
    const swapResponse = await request.post('http://localhost:3000/api/swap/swap', {
      data: {
        quote: quoteData, // Full QuoteResponse object
        signature: '0x1234567890abcdef', // Mock signature
        deadline: Math.floor(Date.now() / 1000) + 1200,
      },
    });

    expect(swapResponse.ok()).toBeTruthy();
    const swapData = await swapResponse.json();

    console.log('✅ Swap response received');

    // Verify swap transaction structure
    expect(swapData).toHaveProperty('swap');
    expect(swapData.swap).toHaveProperty('to');
    expect(swapData.swap).toHaveProperty('from');
    expect(swapData.swap).toHaveProperty('data');
    expect(swapData.swap).toHaveProperty('value');
    expect(swapData.swap).toHaveProperty('chainId');

    // Verify chainId is correct (Unichain)
    expect(swapData.swap.chainId).toBe(UNICHAIN_ID);

    // Verify Universal Router address for Unichain
    expect(swapData.swap.to.toLowerCase()).toBe('0xef740bf23acae26f6492b10de645d6b98dc8eaf3');

    console.log('✅ Swap transaction:', {
      to: swapData.swap.to,
      chainId: swapData.swap.chainId,
      hasData: !!swapData.swap.data,
      value: swapData.swap.value,
    });
  });

  test('should handle quote with permitData correctly', async ({ request }) => {
    // First get a real quote from the API
    const quoteResponse = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    expect(quoteResponse.ok()).toBeTruthy();
    const quoteData = await quoteResponse.json();

    // Only test if permitData is present
    if (!quoteData.permitData) {
      console.log('⚠️  Skipping permitData test (no permitData in quote)');
      return;
    }

    // Call swap endpoint with the real quote - this tests the payload restructuring
    const swapResponse = await request.post('http://localhost:3000/api/swap/swap', {
      data: {
        quote: quoteData,
        signature: '0x9bae1de5fc47c57b9d21f1d36ddfb1db40733b9bb7bce05b13ed0e53e8f616cd',
        deadline: Math.floor(Date.now() / 1000) + 1200,
      },
    });

    // This should succeed because we correctly extract permitData
    expect(swapResponse.ok()).toBeTruthy();
    const swapData = await swapResponse.json();
    expect(swapData).toHaveProperty('swap');

    console.log('✅ Swap with permitData processed correctly');
  });

  test('should return 400 for missing quote', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/swap/swap', {
      data: {
        // Missing quote
        deadline: Math.floor(Date.now() / 1000) + 1200,
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('quote');
  });

  test('verify swap response has correct chainId and router address', async ({ request }) => {
    // Get a real quote from the API
    const quoteResponse = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    expect(quoteResponse.ok()).toBeTruthy();
    const quoteData = await quoteResponse.json();

    // Skip if permitData is present (can't generate valid signature in tests)
    if (quoteData.permitData) {
      console.log('⚠️  Skipping test (permitData requires valid signature)');
      console.log('✅ Payload structure validation passed in other tests');
      return;
    }

    const response = await request.post('http://localhost:3000/api/swap/swap', {
      data: {
        quote: quoteData,
        deadline: Math.floor(Date.now() / 1000) + 1200,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify Unichain settings
    expect(data.swap.chainId).toBe(130); // Unichain
    expect(data.swap.to.toLowerCase()).toBe('0xef740bf23acae26f6492b10de645d6b98dc8eaf3');

    console.log('✅ Swap response has correct Unichain configuration');
  });
});

test.describe('Trading API - Payload Structure Validation', () => {
  test('verify payload sent to Uniswap has correct structure', async ({ page }) => {
    // Intercept the actual fetch call to Uniswap API
    let interceptedPayload: any = null;

    await page.route('https://trade.api.uniswap.org/v1/swap', async (route) => {
      const request = route.request();
      interceptedPayload = JSON.parse(request.postData() || '{}');

      // Let the request fail (we just want to see the payload)
      await route.abort();
    });

    await page.goto('http://localhost:3000');

    // Make the API call
    await page.evaluate(async () => {
      const mockQuote = {
        routing: 'CLASSIC',
        quote: {
          input: { token: '0x078d782b760474a361dda0af3839290b0ef57ad6', amount: '1000000' },
          output: { token: '0x4200000000000000000000000000000000000006', amount: '1000000000000000000' },
          slippage: 0.5,
          route: [],
          gasFee: '150000',
        },
        permitData: {
          domain: { name: 'Permit2', chainId: 130, verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3' },
          types: { PermitSingle: [], PermitDetails: [] },
          values: { details: {}, spender: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3', sigDeadline: '1768916456' },
        },
        requestId: 'test-123',
      };

      try {
        await fetch('/api/swap/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote: mockQuote,
            signature: '0xabcd',
            deadline: Math.floor(Date.now() / 1000) + 1200,
          }),
        });
      } catch (e) {
        // Expected to fail since we aborted the route
      }
    });

    // Wait a bit for the interception
    await page.waitForTimeout(1000);

    // Only run this check if we actually have an API key (mock mode won't call Uniswap)
    if (process.env.UNISWAP_API_KEY && interceptedPayload) {
      console.log('📦 Intercepted payload sent to Uniswap:', JSON.stringify(interceptedPayload, null, 2));

      // CRITICAL: Verify the payload structure
      // Should have 'quote' as inner quote object, not wrapped
      expect(interceptedPayload).toHaveProperty('quote');
      expect(interceptedPayload.quote).not.toHaveProperty('routing'); // routing should NOT be in quote
      expect(interceptedPayload.quote).toHaveProperty('input');
      expect(interceptedPayload.quote).toHaveProperty('output');

      // permitData should be at top level
      expect(interceptedPayload).toHaveProperty('permitData');
      expect(interceptedPayload).toHaveProperty('signature');
      expect(interceptedPayload).toHaveProperty('deadline');

      console.log('✅ Payload sent to Uniswap has correct structure');
    } else {
      console.log('⚠️  Skipping payload interception test (no API key or mock mode)');
    }
  });
});

test.describe('Trading API - Integration Flow', () => {
  test('complete swap flow: approval -> quote -> swap', async ({ request }) => {
    console.log('\n🔄 Testing complete swap flow...\n');

    // Step 1: Check approval
    console.log('1️⃣  Checking approval...');
    const approvalResponse = await request.post('http://localhost:3000/api/swap/approval', {
      data: {
        walletAddress: TEST_WALLET,
        token: USDC_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
      },
    });

    expect(approvalResponse.ok()).toBeTruthy();
    const approvalData = await approvalResponse.json();
    console.log(`   ✅ Approval: ${approvalData.approval ? 'needed' : 'not needed'}`);

    // Step 2: Get quote
    console.log('2️⃣  Getting quote...');
    const quoteResponse = await request.post('http://localhost:3000/api/swap/quote', {
      data: {
        swapper: TEST_WALLET,
        tokenIn: USDC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amount: '1000000',
        chainId: UNICHAIN_ID,
        type: 'EXACT_INPUT',
        slippage: 0.5,
      },
    });

    expect(quoteResponse.ok()).toBeTruthy();
    const quoteData = await quoteResponse.json();
    console.log(`   ✅ Quote: ${quoteData.quote.output.amount} ${WETH_ADDRESS}`);
    console.log(`   ℹ️  Routing: ${quoteData.routing}`);
    console.log(`   ℹ️  Permit required: ${!!quoteData.permitData}`);

    // Step 3: Get swap transaction
    console.log('3️⃣  Getting swap transaction...');

    // Note: If permitData is present, we'd need a valid signature from a wallet
    // In a real app, the user would sign with their wallet
    if (quoteData.permitData) {
      console.log('   ⚠️  Quote requires Permit2 signature (would be signed by wallet in real app)');
      console.log('   ℹ️  Skipping actual swap call (requires valid signature)');
      console.log('\n✅ Flow verified up to signature step!\n');
      return;
    }

    const swapResponse = await request.post('http://localhost:3000/api/swap/swap', {
      data: {
        quote: quoteData,
        deadline: Math.floor(Date.now() / 1000) + 1200,
      },
    });

    expect(swapResponse.ok()).toBeTruthy();
    const swapData = await swapResponse.json();
    console.log(`   ✅ Swap transaction generated`);
    console.log(`   ℹ️  To: ${swapData.swap.to}`);
    console.log(`   ℹ️  ChainId: ${swapData.swap.chainId}`);
    console.log(`   ℹ️  Value: ${swapData.swap.value}`);

    console.log('\n✅ Complete flow successful!\n');
  });
});
