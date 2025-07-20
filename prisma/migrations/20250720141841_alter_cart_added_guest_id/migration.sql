/*
  Warnings:

  - A unique constraint covering the columns `[guestId,productId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_fkey";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "cart_items_guestId_idx" ON "cart_items"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_guestId_productId_key" ON "cart_items"("guestId", "productId");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
