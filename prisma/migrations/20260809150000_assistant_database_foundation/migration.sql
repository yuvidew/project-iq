-- Enable pgvector for project assistant RAG embeddings and semantic cache.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "TaskCommentSource" AS ENUM ('MANUAL', 'CHAT');

-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');

-- CreateEnum
CREATE TYPE "AssistantResponseType" AS ENUM ('TEXT', 'TASK_TABLE', 'SUMMARY_CARDS', 'PROGRESS_CHART', 'ACTION_CONFIRMATION', 'ERROR');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('PROJECT', 'TASK', 'TASK_COMMENT', 'DOCUMENT', 'CHAT_MESSAGE');

-- CreateTable
CREATE TABLE "task_comment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" "TaskCommentSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_session" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "responseType" "AssistantResponseType" NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_source" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT,
    "contentHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_embedding" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL DEFAULT 768,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semantic_cache_entry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "question" TEXT NOT NULL,
    "normalizedQuestion" TEXT NOT NULL,
    "questionHash" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "responseType" "AssistantResponseType" NOT NULL DEFAULT 'TEXT',
    "responsePayload" JSONB,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL DEFAULT 768,
    "embedding" vector(768),
    "expiresAt" TIMESTAMP(3),
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semantic_cache_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_comment_taskId_createdAt_idx" ON "task_comment"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_comment_authorId_idx" ON "task_comment"("authorId");

-- CreateIndex
CREATE INDEX "chat_session_projectId_userId_updatedAt_idx" ON "chat_session"("projectId", "userId", "updatedAt");

-- CreateIndex
CREATE INDEX "chat_session_userId_idx" ON "chat_session"("userId");

-- CreateIndex
CREATE INDEX "chat_message_sessionId_createdAt_idx" ON "chat_message"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "knowledge_source_projectId_type_idx" ON "knowledge_source"("projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_source_projectId_type_sourceId_key" ON "knowledge_source"("projectId", "type", "sourceId");

-- CreateIndex
CREATE INDEX "knowledge_chunk_projectId_idx" ON "knowledge_chunk"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunk_sourceId_chunkIndex_key" ON "knowledge_chunk"("sourceId", "chunkIndex");

-- CreateIndex
CREATE INDEX "knowledge_embedding_projectId_provider_model_idx" ON "knowledge_embedding"("projectId", "provider", "model");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_embedding_chunkId_provider_model_key" ON "knowledge_embedding"("chunkId", "provider", "model");

-- CreateIndex
CREATE INDEX "semantic_cache_entry_projectId_userId_idx" ON "semantic_cache_entry"("projectId", "userId");

-- CreateIndex
CREATE INDEX "semantic_cache_entry_expiresAt_idx" ON "semantic_cache_entry"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "semantic_cache_entry_projectId_questionHash_model_key" ON "semantic_cache_entry"("projectId", "questionHash", "model");

-- CreateVectorIndex
CREATE INDEX "knowledge_embedding_embedding_cosine_idx"
ON "knowledge_embedding"
USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100)
WHERE "embedding" IS NOT NULL;

-- CreateVectorIndex
CREATE INDEX "semantic_cache_entry_embedding_cosine_idx"
ON "semantic_cache_entry"
USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100)
WHERE "embedding" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "task_comment" ADD CONSTRAINT "task_comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comment" ADD CONSTRAINT "task_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_source" ADD CONSTRAINT "knowledge_source_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunk" ADD CONSTRAINT "knowledge_chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunk" ADD CONSTRAINT "knowledge_chunk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_embedding" ADD CONSTRAINT "knowledge_embedding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "knowledge_chunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_embedding" ADD CONSTRAINT "knowledge_embedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semantic_cache_entry" ADD CONSTRAINT "semantic_cache_entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semantic_cache_entry" ADD CONSTRAINT "semantic_cache_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
