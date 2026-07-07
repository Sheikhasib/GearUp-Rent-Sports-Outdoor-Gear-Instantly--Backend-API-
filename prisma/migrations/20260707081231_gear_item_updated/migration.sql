/*
  Warnings:

  - You are about to drop the column `isActive` on the `gear_items` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `gear_items` table. All the data in the column will be lost.
  - Added the required column `priceRatePerDay` to the `gear_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "gear_items_categoryId_price_idx";

-- AlterTable
ALTER TABLE "gear_items" DROP COLUMN "isActive",
DROP COLUMN "price",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceRatePerDay" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE INDEX "gear_items_categoryId_priceRatePerDay_idx" ON "gear_items"("categoryId", "priceRatePerDay");
