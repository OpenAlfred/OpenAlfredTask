-- Personal access tokens for the MCP server. Only the SHA-256 hash of a token is stored.

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "prefix" VARCHAR(16) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_userId_idx" ON "ApiToken"("userId");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
