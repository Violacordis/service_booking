/*
  Warnings:

  - You are about to alter the column `name` on the `product_categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `description` on the `product_categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `product_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `product_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "currency" SET DEFAULT 'gbp';

-- AlterTable
ALTER TABLE "product_categories" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "product_items" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "code" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" "Currency" NOT NULL DEFAULT 'gbp',
    "imageUrl" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_items_code_key" ON "product_items"("code");

-- CreateIndex
CREATE INDEX "product_items_name_idx" ON "product_items"("name");

-- CreateIndex
CREATE INDEX "product_items_code_idx" ON "product_items"("code");

-- CreateIndex
CREATE INDEX "product_items_categoryId_idx" ON "product_items"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- AddForeignKey
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
