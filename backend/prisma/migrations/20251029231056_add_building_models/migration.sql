-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('POWER', 'WATER', 'FOOD', 'SERVICES', 'HOUSING', 'EMPLOYMENT');

-- CreateEnum
CREATE TYPE "RoleLevel" AS ENUM ('SUBURB', 'CITY', 'NATIONAL');

-- CreateTable
CREATE TABLE "BuildingCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "BuildingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT,
    "sizeX" INTEGER NOT NULL,
    "sizeY" INTEGER NOT NULL,
    "blocks" INTEGER NOT NULL,
    "employs" INTEGER,
    "houses" INTEGER,
    "services" INTEGER,
    "feeds" INTEGER,
    "waterUsage" INTEGER,
    "powerUsage" INTEGER,
    "waterOutput" INTEGER,
    "powerOutput" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "minRoleLevel" "RoleLevel" NOT NULL DEFAULT 'CITY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityBuilding" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "gx" INTEGER,
    "gy" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityBuilding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingResourceStat" (
    "id" SERIAL NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "type" "ResourceType" NOT NULL,
    "input" INTEGER,
    "output" INTEGER,

    CONSTRAINT "BuildingResourceStat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BuildingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityBuilding" ADD CONSTRAINT "CityBuilding_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityBuilding" ADD CONSTRAINT "CityBuilding_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingResourceStat" ADD CONSTRAINT "BuildingResourceStat_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
