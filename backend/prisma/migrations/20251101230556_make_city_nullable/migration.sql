-- DropForeignKey
ALTER TABLE "public"."Building" DROP CONSTRAINT "Building_cityId_fkey";

-- AlterTable
ALTER TABLE "Building" ALTER COLUMN "cityId" DROP NOT NULL,
ALTER COLUMN "cityId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
