/*
  Warnings:

  - You are about to drop the column `organizationId` on the `organization_member` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `projectLeadId` on the `project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,organizationSlug]` on the table `organization_member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationSlug` to the `organization_member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationSlug` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organization_member" DROP CONSTRAINT "organization_member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_projectLeadId_fkey";

-- DropIndex
DROP INDEX "organization_member_organizationId_idx";

-- DropIndex
DROP INDEX "organization_member_userId_organizationId_key";

-- DropIndex
DROP INDEX "project_organizationId_idx";

-- AlterTable
ALTER TABLE "organization_member" DROP COLUMN "organizationId",
ADD COLUMN     "organizationSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project" DROP COLUMN "organizationId",
DROP COLUMN "projectLeadId",
ADD COLUMN     "organizationSlug" TEXT NOT NULL,
ADD COLUMN     "projectLeadEmail" TEXT;

-- CreateIndex
CREATE INDEX "organization_member_organizationSlug_idx" ON "organization_member"("organizationSlug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_userId_organizationSlug_key" ON "organization_member"("userId", "organizationSlug");

-- CreateIndex
CREATE INDEX "project_organizationSlug_idx" ON "project"("organizationSlug");

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organizationSlug_fkey" FOREIGN KEY ("organizationSlug") REFERENCES "organization"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationSlug_fkey" FOREIGN KEY ("organizationSlug") REFERENCES "organization"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_projectLeadEmail_fkey" FOREIGN KEY ("projectLeadEmail") REFERENCES "user"("email") ON DELETE SET NULL ON UPDATE CASCADE;
