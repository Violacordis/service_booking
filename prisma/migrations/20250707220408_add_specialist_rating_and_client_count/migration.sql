-- AlterTable
ALTER TABLE "specialists" ADD COLUMN     "clientCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "specialist_ratings" (
    "id" UUID NOT NULL,
    "specialistId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "appointmentId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "specialist_ratings_specialistId_idx" ON "specialist_ratings"("specialistId");

-- CreateIndex
CREATE INDEX "specialist_ratings_clientId_idx" ON "specialist_ratings"("clientId");

-- CreateIndex
CREATE INDEX "specialist_ratings_rating_idx" ON "specialist_ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_ratings_specialistId_clientId_appointmentId_key" ON "specialist_ratings"("specialistId", "clientId", "appointmentId");

-- AddForeignKey
ALTER TABLE "specialist_ratings" ADD CONSTRAINT "specialist_ratings_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_ratings" ADD CONSTRAINT "specialist_ratings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_ratings" ADD CONSTRAINT "specialist_ratings_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
