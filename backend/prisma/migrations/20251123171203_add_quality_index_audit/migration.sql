-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_hierarchyId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hierarchyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QualityIndexAudit" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "oldValue" DOUBLE PRECISION NOT NULL,
    "newValue" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityIndexAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "HierarchyLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityIndexAudit" ADD CONSTRAINT "QualityIndexAudit_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
