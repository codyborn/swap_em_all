# Swap 'Em All API Documentation

Complete reference for all API endpoints in the Swap 'Em All application.

**Base URL**: `https://swap-em-all.vercel.app`

---

## Table of Contents

- [Token Endpoints](#token-endpoints)
  - [GET /api/tokens](#get-apitokens)
  - [GET /api/tokens/encounter](#get-apitokensencounter)
  - [POST /api/tokens/prices](#post-apitokensprices)
  - [GET /api/tokens/prices](#get-apitokensprices)
- [Game Endpoints](#game-endpoints)
  - [POST /api/game/capture](#post-apigamecapture)
  - [GET /api/game/stats](#get-apigamestats)
- [Swap Endpoints](#swap-endpoints)
  - [POST /api/swap/approval](#post-apiswapapproval)
  - [POST /api/swap/quote](#post-apiswapquote)
  - [POST /api/swap/swap](#post-apiswapswap)
- [Cron Endpoints](#cron-endpoints)
  - [POST /api/cron/update-prices](#post-apicronupdate-prices)

---

## Token Endpoints

### GET /api/tokens

Returns a list of available tokens with game metadata.

**Response:**

```json
{
  "tokens": [
    {
      "address": "0x4200000000000000000000000000000000000006",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "volume24h": 50000000,
      "rarity": "uncommon",
      "creatureName": "Etheron",
      "encounterProbability": 0.18,
      "spriteUrl": "/assets/sprites/tokens/weth.png"
    }
  ],
  "totalVolume": 278000000,
  "timestamp": 1704067200000
}
```

**Rarity Levels:**
- `common` - Stablecoins (USDC, DAI, USDbC)
- `uncommon` - Wrapped assets (WETH, cbETH)
- `rare` - Memecoins (PEPE, DEGEN, TOSHI)
- `legendary` - Rare tokens (BRETT, MFER)

---

### GET /api/tokens/encounter

Generates a random token encounter using volume-weighted selection.

**Response:**

```json
{
  "token": {
    "symbol": "WETH",
    "name": "Wrapped Ether",
    "address": "0x4200000000000000000000000000000000000006",
    "decimals": 18,
    "rarity": "uncommon",
    "price": 2450.00,
    "spriteUrl": "/assets/sprites/tokens/weth.png",
    "encounterText": "A wild Wrapped Ether appeared!"
  },
  "timestamp": 1704067200000
}
```

**Price Source:** Real-time prices from CoinGecko API

---

### POST /api/tokens/prices

Batch fetch current prices for multiple tokens.

**Request:**

```json
{
  "addresses": ["WETH", "USDC", "DAI"]
}
```

**Note:** Addresses can be:
- Symbol only: `"WETH"`
- Symbol with address: `"WETH:0x4200000000000000000000000000000000000006"`

**Response:**

```json
{
  "WETH": 2450.00,
  "USDC": 1.00,
  "DAI": 0.99
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Invalid addresses array` |
| 500 | `Failed to fetch token prices` |

---

### GET /api/tokens/prices

Get prices for multiple tokens via query parameters.

**Query Parameters:**
- `addresses` - Comma-separated list of token symbols or addresses

**Example:**
```
GET /api/tokens/prices?addresses=WETH,USDC,DAI
```

**Response:**
```json
{
  "WETH": 2450.00,
  "USDC": 1.00,
  "DAI": 0.99
}
```

---

## Game Endpoints

### POST /api/game/capture

Register a successful token capture after on-chain transaction.

**Authentication:** None (public endpoint)

**Request:**

```json
{
  "txHash": "0x123...",
  "walletAddress": "0xabc...",
  "tokenAddress": "0x4200000000000000000000000000000000000006",
  "expectedAmount": "1000000000000000000",
  "usdcSpent": "1000000"
}
```

**Validation:**
- Verifies transaction exists and succeeded on-chain
- Confirms transaction sender matches `walletAddress`
- Validates USDC was spent in transaction
- Prevents duplicate captures

**Response:**

```json
{
  "success": true,
  "capture": {
    "id": "clx123abc",
    "token": {
      "address": "0x4200000000000000000000000000000000000006",
      "symbol": "WETH",
      "name": "Wrapped Ether"
    },
    "amountCaptured": "1000000000000000000",
    "purchasePrice": "2450.123456",
    "capturedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | Missing required fields |
| 400 | Transaction failed on-chain |
| 400 | Transaction sender mismatch |
| 400 | No USDC transfer found |
| 404 | Transaction not found or not mined |
| 409 | Transaction already registered |
| 500 | Server error |

---

### GET /api/game/stats

Get user's captured tokens with current stats and price history.

**Query Parameters:**
- `address` (required) - User's wallet address

**Example:**
```
GET /api/game/stats?address=0xabc123...
```

**Response:**

```json
{
  "totalCaptures": 5,
  "totalValue": "12450.123456",
  "totalProfitLoss": "2450.123456",
  "totalProfitLossPercent": "24.50",
  "captures": [
    {
      "captureId": "clx123abc",
      "token": {
        "address": "0x4200000000000000000000000000000000000006",
        "symbol": "WETH",
        "name": "Wrapped Ether",
        "decimals": 18
      },
      "amountCaptured": "1000000000000000000",
      "purchasePrice": "2000.000000",
      "currentPrice": "2450.123456",
      "profitLoss": "+450.123456",
      "profitLossPercent": "+22.51",
      "capturedAt": "2024-01-20T15:30:00.000Z",
      "priceHistory": [
        { "price": 2000.00, "timestamp": 1704067200000 },
        { "price": 2100.00, "timestamp": 1704067260000 },
        { "price": 2450.12, "timestamp": 1704067320000 }
      ]
    }
  ]
}
```

**Price History:**
- Returns last 100 price points since token was captured
- Filtered to only include prices after `capturedAt` timestamp
- Ordered oldest to newest (chronological)

**Empty Response (no captures):**

```json
{
  "totalCaptures": 0,
  "totalValue": "0",
  "totalProfitLoss": "0",
  "captures": []
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required parameter: address` |
| 500 | `Failed to fetch stats` |

---

## Swap Endpoints

### POST /api/swap/approval

Check if token approval is needed for swap.

**Request:**

```json
{
  "walletAddress": "0xabc...",
  "token": "0x4200000000000000000000000000000000000006",
  "amount": "1000000000000000000",
  "chainId": 130
}
```

**Response (approval needed):**

```json
{
  "approval": {
    "to": "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    "from": "0xabc...",
    "data": "0x095ea7b3...",
    "value": "0",
    "chainId": 130
  }
}
```

**Response (already approved):**

```json
{
  "approval": null
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | Missing required parameters |
| 500 | Failed to check approval |

**Mock Mode:** If `UNISWAP_API_KEY` is not set, returns mock response (assumes approved).

---

### POST /api/swap/quote

Get swap quote from Uniswap Trading API.

**Request:**

```json
{
  "tokenIn": "0x078d782b760474a361dda0af3839290b0ef57ad6",
  "tokenOut": "0x4200000000000000000000000000000000000006",
  "amount": "1000000",
  "chainId": 130,
  "swapper": "0xabc...",
  "slippage": 0.5,
  "type": "EXACT_INPUT"
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| tokenIn | string | Yes | - | Input token address |
| tokenOut | string | Yes | - | Output token address |
| amount | string | Yes | - | Amount in token decimals |
| chainId | number | Yes | - | Chain ID (130 = Unichain) |
| swapper | string | Yes | - | User's wallet address |
| slippage | number | No | 0.5 | Slippage tolerance (0-100) |
| type | string | No | EXACT_INPUT | EXACT_INPUT or EXACT_OUTPUT |

**Response:**

```json
{
  "routing": "CLASSIC",
  "quote": {
    "input": {
      "token": "0x078d782b760474a361dda0af3839290b0ef57ad6",
      "amount": "1000000"
    },
    "output": {
      "token": "0x4200000000000000000000000000000000000006",
      "amount": "408163265306122"
    },
    "slippage": 0.5,
    "route": [...],
    "gasFee": "150000"
  },
  "permitData": {...},
  "requestId": "req_123abc"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | Missing required parameters |
| 401 | Invalid API key |
| 404 | No route found for token pair |
| 429 | Rate limit exceeded |
| 500 | Failed to generate quote |

**Mock Mode:** If `UNISWAP_API_KEY` is not set, returns mock quote.

---

### POST /api/swap/swap

Get executable swap transaction from Uniswap Trading API.

**Request:**

```json
{
  "quote": {
    "routing": "CLASSIC",
    "quote": {...},
    "permitData": {...},
    "requestId": "req_123abc"
  },
  "signature": "0x123...",
  "deadline": 1704068400
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quote | object | Yes | Full quote response from /quote endpoint |
| signature | string | No | Permit2 signature (if using Permit2) |
| deadline | number | No | Unix timestamp (default: 20 min from now) |

**Response:**

```json
{
  "swap": {
    "to": "0xef740bf23acae26f6492b10de645d6b98dc8eaf3",
    "from": "0xabc...",
    "data": "0x3593564c...",
    "value": "0",
    "chainId": 130,
    "gasLimit": "250000"
  }
}
```

**Transaction Execution:**

```typescript
// Sign and send transaction using wagmi/viem
const hash = await walletClient.sendTransaction({
  to: swap.to,
  from: swap.from,
  data: swap.data,
  value: BigInt(swap.value),
  gas: BigInt(swap.gasLimit)
});
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | Missing required parameter: quote |
| 400 | Quote has expired |
| 500 | Failed to generate swap transaction |

**Mock Mode:** If `UNISWAP_API_KEY` is not set, returns mock transaction.

---

## Cron Endpoints

### POST /api/cron/update-prices

Updates token prices in database from Uniswap Trading API.

**Authentication:** Required
- Header: `Authorization: Bearer <CRON_SECRET>`
- Only required in production
- Vercel automatically adds this header for configured cron jobs

**Cron Schedule:** Every minute (`* * * * *`)

**Configuration:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-prices",
    "schedule": "* * * * *"
  }]
}
```

**Process:**
1. Fetch all tokens from database (excluding USDC)
2. Get quote for 1 USDC → Token for each token
3. Calculate price from quote output amount
4. Store price in `TokenPrice` table
5. Add 100ms delay between requests to avoid rate limiting

**Response:**

```json
{
  "success": true,
  "updated": 7,
  "failed": 0,
  "results": [
    { "token": "WETH", "success": true },
    { "token": "WBTC", "success": true },
    { "token": "UNI", "success": false, "error": "No route found" }
  ]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | Unauthorized (invalid CRON_SECRET) |
| 500 | No API key configured |
| 500 | Failed to update prices |

**Manual Testing (Development Only):**

```bash
# GET method allowed in development
curl http://localhost:3000/api/cron/update-prices
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing auth |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limits

**Uniswap Trading API:**
- Rate limits enforced by Uniswap
- Returns 429 status when exceeded
- Recommended: Implement client-side retry with exponential backoff

**CoinGecko API (Price Service):**
- Free tier: 10-30 calls/minute
- Used by `/tokens/encounter` and `/tokens/prices`

---

## Environment Variables

Required environment variables for API functionality:

```bash
# Uniswap Trading API
UNISWAP_API_KEY=your_api_key_here

# Database (Prisma)
DATABASE_URL=postgresql://...

# Cron Authentication
CRON_SECRET=your_secret_here

# Optional: CoinGecko Pro API
COINGECKO_API_KEY=your_key_here
```

---

## Error Handling Best Practices

### Client-Side

```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return await response.json();
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(await response.text());
      }

      // Retry server errors (5xx)
      if (i < retries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
        continue;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

### Handle Rate Limits

```typescript
if (error.status === 429) {
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, 60000));
  return retry();
}
```

---

## Database Schema

### User
- `id` - UUID
- `address` - Wallet address (unique)
- `createdAt` - Timestamp

### Token
- `id` - UUID
- `address` - Token address (unique per chain)
- `symbol` - Token symbol
- `name` - Token name
- `decimals` - Token decimals
- `chainId` - Chain ID

### TokenPrice
- `id` - UUID
- `tokenId` - Foreign key to Token
- `price` - Price in USD (decimal string)
- `timestamp` - Price timestamp
- `source` - Price source (e.g., "trading-api")

### TokenCapture
- `id` - UUID
- `userId` - Foreign key to User
- `tokenId` - Foreign key to Token
- `txHash` - Transaction hash (unique)
- `purchasePrice` - Purchase price in USD
- `amountCaptured` - Token amount captured
- `usdcSpent` - USDC spent
- `verified` - Transaction verified
- `capturedAt` - Capture timestamp

---

## Support

For questions or issues with the API:
- GitHub Issues: https://github.com/codyborn/swap_em_all/issues
- Documentation: https://github.com/codyborn/swap_em_all/blob/main/docs/API.md
