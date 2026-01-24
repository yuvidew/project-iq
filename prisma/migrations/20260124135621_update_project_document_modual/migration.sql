-- CreateTable
CREATE TABLE "project_document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_document_projectId_idx" ON "project_document"("projectId");

-- AddForeignKey
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
