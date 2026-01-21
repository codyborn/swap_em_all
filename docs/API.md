# Swap 'Em All Backend API Documentation

The backend API provides server-side functionality for tracking token captures, price updates, and user statistics.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.vercel.app/api
```

## Authentication

All game API endpoints are currently open (no authentication required). In production, you should add wallet signature verification for write operations.

---

## Endpoints

### 1. Register Token Capture

**POST** `/game/capture`

Registers a successful token capture after verifying the on-chain transaction.

#### Request Body

```json
{
  "txHash": "0x...",
  "walletAddress": "0x...",
  "tokenAddress": "0x...",
  "expectedAmount": "1000000000000000000",
  "usdcSpent": "1000000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txHash` | string | Transaction hash to verify |
| `walletAddress` | string | User's wallet address |
| `tokenAddress` | string | Token contract address |
| `expectedAmount` | string | Amount of token received (wei) |
| `usdcSpent` | string | Amount of USDC spent (smallest unit, 6 decimals) |

#### Response

```json
{
  "success": true,
  "capture": {
    "id": "clxxx...",
    "token": {
      "address": "0x...",
      "symbol": "WETH",
      "name": "Wrapped Ether"
    },
    "amountCaptured": "1000000000000000000",
    "purchasePrice": "1.000000",
    "capturedAt": "2026-01-21T00:00:00.000Z"
  }
}
```

#### Error Responses

- `400` - Invalid parameters or failed transaction
- `404` - Transaction not found
- `409` - Transaction already registered
- `500` - Server error

---

### 2. Get User Stats

**GET** `/game/stats?address=0x...`

Returns user's captured tokens with current stats (purchase price, current price, profit/loss).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | User's wallet address |

#### Response

```json
{
  "totalCaptures": 5,
  "totalValue": "5.234567",
  "totalProfitLoss": "0.234567",
  "totalProfitLossPercent": "4.69",
  "captures": [
    {
      "captureId": "clxxx...",
      "token": {
        "address": "0x...",
        "symbol": "WETH",
        "name": "Wrapped Ether",
        "decimals": 18
      },
      "amountCaptured": "1000000000000000000",
      "purchasePrice": "1.000000",
      "currentPrice": "1.050000",
      "profitLoss": "0.050000",
      "profitLossPercent": "5.00",
      "capturedAt": "2026-01-21T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Update Token Prices (Cron)

**POST** `/cron/update-prices`

Updates prices for all tokens by fetching quotes from the Trading API. This endpoint should be called by a cron service.

#### Headers

```
Authorization: Bearer <CRON_SECRET>
```

Required in production to prevent unauthorized access.

#### Response

```json
{
  "success": true,
  "updated": 5,
  "failed": 1,
  "results": [
    {
      "token": "WETH",
      "success": true
    },
    {
      "token": "USDS",
      "success": false,
      "error": "No quotes available"
    }
  ]
}
```

#### Configuration

For Vercel deployments, the cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "* * * * *"
    }
  ]
}
```

This runs every minute. Set `CRON_SECRET` in environment variables for production.

---

## Trading API Proxy Endpoints

These endpoints wrap the Uniswap Trading API to keep API keys server-side.

### 4. Check Token Approval

**POST** `/swap/approval`

Checks if a token needs approval before swapping.

#### Request Body

```json
{
  "walletAddress": "0x...",
  "token": "0x...",
  "amount": "1000000",
  "chainId": 130
}
```

#### Response

```json
{
  "approval": {
    "to": "0x...",
    "from": "0x...",
    "data": "0x...",
    "value": "0",
    "chainId": 130
  }
}
```

If `approval` is `null`, the token is already approved.

---

### 5. Get Swap Quote

**POST** `/swap/quote`

Gets an optimal swap quote with routing.

#### Request Body

```json
{
  "swapper": "0x...",
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "amount": "1000000",
  "chainId": 130,
  "type": "EXACT_INPUT",
  "slippage": 0.5
}
```

#### Response

```json
{
  "routing": "CLASSIC",
  "quote": {
    "input": {
      "token": "0x...",
      "amount": "1000000"
    },
    "output": {
      "token": "0x...",
      "amount": "1000000000000000000"
    },
    "slippage": 0.5,
    "route": [...],
    "gasFee": "150000"
  },
  "permitData": {...},
  "requestId": "..."
}
```

---

### 6. Execute Swap

**POST** `/swap/swap`

Generates a ready-to-sign swap transaction.

#### Request Body

```json
{
  "quote": {
    "routing": "CLASSIC",
    "quote": {...},
    "permitData": {...}
  },
  "signature": "0x...",
  "deadline": 1768915864
}
```

#### Response

```json
{
  "swap": {
    "to": "0x...",
    "from": "0x...",
    "data": "0x...",
    "value": "0",
    "chainId": 130,
    "gasLimit": "250000"
  }
}
```

---

## Database Schema

### Tables

#### User
- `id`: Primary key
- `address`: Wallet address (unique, indexed)
- `createdAt`: Registration timestamp
- `updatedAt`: Last update timestamp

#### Token
- `id`: Primary key
- `address`: Contract address (unique, indexed)
- `symbol`: Token symbol (e.g., "WETH")
- `name`: Token name (e.g., "Wrapped Ether")
- `decimals`: Token decimals
- `chainId`: Chain ID (indexed)
- `createdAt`: Creation timestamp

#### TokenCapture
- `id`: Primary key
- `userId`: Foreign key to User
- `tokenId`: Foreign key to Token
- `txHash`: Transaction hash (unique, indexed)
- `purchasePrice`: Price in USD at time of capture
- `amountCaptured`: Amount of token captured
- `usdcSpent`: Amount of USDC spent
- `verified`: Verification status
- `verifiedAt`: Verification timestamp
- `capturedAt`: Capture timestamp (indexed)

#### TokenPrice
- `id`: Primary key
- `tokenId`: Foreign key to Token
- `price`: Price in USD
- `source`: Price source (e.g., "trading-api")
- `timestamp`: Price timestamp (indexed)

---

## Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# Uniswap Trading API
UNISWAP_API_KEY="your-api-key"

# Cron Security
CRON_SECRET="your-secret-for-cron-endpoints"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial tokens
npx tsx scripts/seed.ts
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values.

### 4. Run Development Server

```bash
npm run dev
```

### 5. Test Cron Job (Development)

```bash
curl http://localhost:3000/api/cron/update-prices
```

---

## Production Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `UNISWAP_API_KEY`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy

The cron job will automatically run every minute via Vercel Cron.

### Database Migration

For production, consider using PostgreSQL instead of SQLite:

1. Update `DATABASE_URL` to PostgreSQL connection string
2. Update `prisma/schema.prisma` provider to `postgresql`
3. Run `npx prisma migrate deploy`

---

## Security Considerations

1. **Transaction Verification**: Always verify transactions on-chain before registering captures
2. **Cron Authentication**: Use `CRON_SECRET` to protect cron endpoints in production
3. **Rate Limiting**: Implement rate limiting for public endpoints
4. **Wallet Signature Verification**: Add signature verification for write operations
5. **Input Validation**: Validate all inputs to prevent injection attacks

---

## Rate Limiting

The price update cron includes a 100ms delay between API calls to avoid rate limiting:

```typescript
await new Promise((resolve) => setTimeout(resolve, 100));
```

Adjust this delay if you experience rate limiting issues.

---

## Testing

Run the test suite:

```bash
npm test
```

Test specific endpoints:

```bash
# Test price updates
curl http://localhost:3000/api/cron/update-prices

# Test stats endpoint
curl "http://localhost:3000/api/game/stats?address=0x24EcD23096fCF03A15ee8a6FE63F24345Cc4BA46"
```

---

## Troubleshooting

### Database Connection Issues

If you get Prisma connection errors:

```bash
npx prisma generate
npx prisma migrate dev
```

### Missing Prices

If tokens show no prices:

1. Check that the cron job is running
2. Verify `UNISWAP_API_KEY` is set
3. Check logs for API errors

### Transaction Verification Failures

Common issues:
- Transaction not yet mined (wait and retry)
- Transaction failed on-chain (check block explorer)
- Wrong wallet address (verify sender matches)
