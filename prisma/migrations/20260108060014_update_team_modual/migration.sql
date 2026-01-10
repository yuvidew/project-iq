/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `TeamInvite` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `TeamInvite` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "TeamInvite" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");

-- CreateIndex
CREATE INDEX "TeamInvite_email_status_idx" ON "TeamInvite"("email", "status");

-- CreateIndex
CREATE INDEX "TeamInvite_token_idx" ON "TeamInvite"("token");
