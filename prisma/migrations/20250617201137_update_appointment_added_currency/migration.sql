-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('usd', 'eur', 'gbp', 'ngn');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'usd',
ADD COLUMN     "notes" VARCHAR(255);
