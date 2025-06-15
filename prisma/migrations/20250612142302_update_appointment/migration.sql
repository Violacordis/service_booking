-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "numberOfClients" INTEGER DEFAULT 1,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
