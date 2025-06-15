/*
  Warnings:

  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isGuest` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "firstName",
DROP COLUMN "isGuest",
DROP COLUMN "lastName",
ADD COLUMN     "country" VARCHAR(255),
ADD COLUMN     "fullName" VARCHAR(255) NOT NULL,
ADD COLUMN     "state" VARCHAR(255),
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(50);
