-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TokenCapture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "purchasePrice" TEXT NOT NULL,
    "amountCaptured" TEXT NOT NULL,
    "usdcSpent" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    CONSTRAINT "TokenCapture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TokenCapture_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TokenPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenPrice_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE INDEX "User_address_idx" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");

-- CreateIndex
CREATE INDEX "Token_address_idx" ON "Token"("address");

-- CreateIndex
CREATE INDEX "Token_chainId_idx" ON "Token"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenCapture_txHash_key" ON "TokenCapture"("txHash");

-- CreateIndex
CREATE INDEX "TokenCapture_userId_idx" ON "TokenCapture"("userId");

-- CreateIndex
CREATE INDEX "TokenCapture_tokenId_idx" ON "TokenCapture"("tokenId");

-- CreateIndex
CREATE INDEX "TokenCapture_txHash_idx" ON "TokenCapture"("txHash");

-- CreateIndex
CREATE INDEX "TokenCapture_capturedAt_idx" ON "TokenCapture"("capturedAt");

-- CreateIndex
CREATE INDEX "TokenPrice_tokenId_idx" ON "TokenPrice"("tokenId");

-- CreateIndex
CREATE INDEX "TokenPrice_timestamp_idx" ON "TokenPrice"("timestamp");

-- CreateIndex
CREATE INDEX "TokenPrice_tokenId_timestamp_idx" ON "TokenPrice"("tokenId", "timestamp");
