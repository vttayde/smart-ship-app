/*
  Warnings:

  - You are about to drop the column `paymentId` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "failureReason" TEXT,
    "gateway" TEXT NOT NULL DEFAULT 'razorpay',
    "gatewayRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "createdAt", "gateway", "gatewayRef", "id", "orderId", "status", "updatedAt") SELECT "amount", "createdAt", "gateway", "gatewayRef", "id", "orderId", "status", "updatedAt" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE UNIQUE INDEX "payments_razorpayOrderId_key" ON "payments"("razorpayOrderId");
CREATE UNIQUE INDEX "payments_razorpayPaymentId_key" ON "payments"("razorpayPaymentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
