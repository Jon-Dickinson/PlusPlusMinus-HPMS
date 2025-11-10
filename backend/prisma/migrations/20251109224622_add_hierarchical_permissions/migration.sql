/*
  Warnings:

  - Added the required column `hierarchyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hierarchyId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "HierarchyLevel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HierarchyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "canBuild" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_categoryId_key" ON "UserPermission"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hierarchyId_fkey" FOREIGN KEY ("hierarchyId") REFERENCES "HierarchyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HierarchyLevel" ADD CONSTRAINT "HierarchyLevel_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "HierarchyLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BuildingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
