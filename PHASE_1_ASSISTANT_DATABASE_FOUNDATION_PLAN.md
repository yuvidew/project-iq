# Phase 1: Assistant Database Foundation Plan

## Goal

Add the database foundation for the project assistant feature:

- Task comments.
- Persistent assistant chat sessions and messages.
- RAG knowledge sources and chunks.
- Embedding storage for vector search.
- Semantic cache for repeated or similar assistant questions.

## Branch

Use:

```text
feature/assistant-database-foundation
```

## Scope

This phase only adds database/schema foundation. It does not add UI, assistant routes, LangGraph flows, embedding jobs, or chat actions yet.

Included:

- Prisma schema models.
- SQL migration for relational tables.
- SQL migration support for `pgvector`, if the database supports it.
- Prisma client generation/schema validation.

Excluded:

- LangChain/LangGraph implementation.
- Assistant UI.
- Task comment UI.
- RAG indexing workers.
- Semantic cache lookup logic.
- PR merge. The user reviews and merges PRs.

## Proposed Models

### `TaskComment`

Stores comments on project tasks.

Fields:

- `id`
- `taskId`
- `authorId`
- `content`
- `source`: `MANUAL`, `CHAT`
- `createdAt`
- `updatedAt`

### `ChatSession`

Stores one assistant conversation for a project and user.

Fields:

- `id`
- `projectId`
- `userId`
- `title`
- `createdAt`
- `updatedAt`

### `ChatMessage`

Stores user and assistant messages.

Fields:

- `id`
- `sessionId`
- `role`: `USER`, `ASSISTANT`, `SYSTEM`, `TOOL`
- `content`
- `responseType`
- `metadata`
- `createdAt`

### `KnowledgeSource`

Represents a source that can be indexed for RAG.

Fields:

- `id`
- `projectId`
- `type`: `PROJECT`, `TASK`, `TASK_COMMENT`, `DOCUMENT`, `CHAT_MESSAGE`
- `sourceId`
- `title`
- `contentHash`
- `metadata`
- `createdAt`
- `updatedAt`

### `KnowledgeChunk`

Stores searchable text chunks from a source.

Fields:

- `id`
- `sourceId`
- `projectId`
- `chunkIndex`
- `content`
- `tokenCount`
- `metadata`
- `createdAt`
- `updatedAt`

### `KnowledgeEmbedding`

Stores vector embeddings for chunks.

Fields:

- `id`
- `chunkId`
- `projectId`
- `provider`
- `model`
- `dimensions`
- `embedding`
- `createdAt`

Implementation note:

- `embedding` should use PostgreSQL `vector` through `pgvector`.
- Prisma should represent this field as `Unsupported("vector(768)")` or another approved vector dimension.
- SQL migrations should create the extension and vector indexes.

### `SemanticCacheEntry`

Stores reusable assistant responses for similar read-only questions.

Fields:

- `id`
- `projectId`
- `userId`
- `question`
- `normalizedQuestion`
- `questionHash`
- `answer`
- `responseType`
- `responsePayload`
- `provider`
- `model`
- `embedding`
- `expiresAt`
- `hitCount`
- `lastHitAt`
- `createdAt`
- `updatedAt`

Implementation note:

- Semantic cache must not be used for write actions.
- Later phases should invalidate or bypass cache when tasks, comments, or documents change.

## Enums

Add:

- `TaskCommentSource`
- `ChatMessageRole`
- `AssistantResponseType`
- `KnowledgeSourceType`

## Verification

Run:

```powershell
npx prisma generate
npx prisma validate
```

If PowerShell blocks `npx`, use:

```powershell
npx.cmd prisma generate
npx.cmd prisma validate
```

## Open Technical Decision

The current DB is PostgreSQL, but vector DB support requires the `pgvector` extension. If the database host does not support `pgvector`, keep the relational models and move embeddings to a separate vector database in a later phase.
