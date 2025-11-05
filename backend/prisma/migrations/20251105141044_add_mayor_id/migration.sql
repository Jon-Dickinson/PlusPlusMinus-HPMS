-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mayorId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mayorId_fkey" FOREIGN KEY ("mayorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
