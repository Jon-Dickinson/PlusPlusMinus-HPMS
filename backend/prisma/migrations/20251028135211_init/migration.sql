/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
ADD COLUMN     "structureId" INTEGER;

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "Structure" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scopeLevel" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "structureId" INTEGER NOT NULL,
    "gx" INTEGER NOT NULL,
    "gy" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Structure_parentId_idx" ON "Structure"("parentId");

-- CreateIndex
CREATE INDEX "Structure_level_idx" ON "Structure"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Asset_structureId_idx" ON "Asset"("structureId");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "User_structureId_idx" ON "User"("structureId");

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
