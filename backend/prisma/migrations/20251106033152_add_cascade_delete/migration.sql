-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_mayorId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mayorId_fkey" FOREIGN KEY ("mayorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
