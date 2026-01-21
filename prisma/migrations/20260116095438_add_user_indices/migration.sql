-- CreateTable
CREATE TABLE "UserIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserIndex_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserIndex_userId_order_idx" ON "UserIndex"("userId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UserIndex_userId_symbol_key" ON "UserIndex"("userId", "symbol");
