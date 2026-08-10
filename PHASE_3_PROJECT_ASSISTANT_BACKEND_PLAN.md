# Phase 3: Project Assistant Backend Plan

## Goal

Build the first project-level assistant backend that can answer useful project questions from real database data and persist chat history for the upcoming assistant UI.

## Branch

Use:

```text
feature/project-assistant-backend
```

## Scope

This phase covers the backend MVP only.

Included:

- Add a `projectAssistant` tRPC router.
- Persist assistant chat sessions and messages with the existing `ChatSession` and `ChatMessage` models.
- Add project access checks for every assistant procedure.
- Return structured assistant payloads for:
  - Summary cards.
  - Task tables.
  - Progress charts.
  - Text answers.
  - Action confirmations.
- Support deterministic answers for:
  - Task counts by status.
  - Project progress percentage.
  - Status distribution.
  - Task lists filtered by status, assignee, due date, or search text.
  - Recent task comments.
  - Project document summaries at a metadata level.
- Draft safe confirmation payloads for task creation or task comments without writing to the database.

Excluded:

- Project assistant UI.
- LangChain/LangGraph package installation.
- Embeddings and vector retrieval.
- Semantic cache lookup.
- Confirmed write-action execution.
- Project-level document RAG over document content.
- PR merge.

## Implementation Plan

1. Create the project assistant server module.
2. Add shared response schemas and payload builders.
3. Add helper functions for project access, session creation, and message persistence.
4. Implement a deterministic intent resolver for common project questions.
5. Register the router in the app router.
6. Add lightweight client hooks/types only if needed for the next UI phase.
7. Run TypeScript, Prisma validation, and build.

## Approval Assumption

The user asked to start the next phase after Phase 2 was merged, so this implementation proceeds with the MVP-safe backend scope above.

## Verification Plan

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npx.cmd prisma validate
npm.cmd run build
```

Manual API smoke checks may be added if there is an existing way to call authenticated tRPC routes locally.

