/*
  Warnings:

  - You are about to drop the `_ServiceCategoryToSpecialists` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branchId` to the `specialists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ServiceCategoryToSpecialists" DROP CONSTRAINT "_ServiceCategoryToSpecialists_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceCategoryToSpecialists" DROP CONSTRAINT "_ServiceCategoryToSpecialists_B_fkey";

-- AlterTable
ALTER TABLE "specialists" ADD COLUMN     "address" VARCHAR(255),
ADD COLUMN     "branchId" UUID NOT NULL,
ADD COLUMN     "city" VARCHAR(255),
ADD COLUMN     "country" VARCHAR(255),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "state" VARCHAR(255);

-- DropTable
DROP TABLE "_ServiceCategoryToSpecialists";

-- CreateTable
CREATE TABLE "specialist_categories" (
    "id" UUID NOT NULL,
    "specialistId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialist_categories_specialistId_categoryId_key" ON "specialist_categories"("specialistId", "categoryId");

-- AddForeignKey
ALTER TABLE "specialist_categories" ADD CONSTRAINT "specialist_categories_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_categories" ADD CONSTRAINT "specialist_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
