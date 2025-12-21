-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "ownerId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
