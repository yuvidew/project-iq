# Project Assistant Feature Plan

This document is the working plan and instruction set for adding the project chat assistant, task image import improvements, task comments, document chat upgrades, and project progress insights.

## Working Agreement

1. Work phase by phase.
2. Before starting any phase, create a short implementation plan for that phase.
3. Ask the user questions when requirements are unclear.
4. Get user approval before starting implementation for each phase.
5. Follow the current codebase patterns, folder structure, UI components, tRPC procedures, Prisma models, and existing hooks.
6. After each phase, verify the feature with tests or manual checks before opening a pull request.
7. Use Chrome for manual browser smoke tests whenever UI or local app verification is part of the phase.
8. Do not merge pull requests. The user will review and merge.

## Branch And PR Workflow

- Create a separate branch for each approved phase or page-level feature.
- Branch names must follow these formats:
  - Feature branches: `feature/<short-description>`
  - Bug-fix branches: `bugfix/<short-description>`
  - UI-fix branches: `ui-fix/<short-description>`
- Write `<short-description>` in lowercase kebab-case.
- Examples:
  - `feature/add-file-viewer-citations`
  - `bugfix/fix-chat-stream-timeout`
  - `ui-fix/improve-repo-dashboard-empty-state`
- After implementation, create a pull request for the phase.
- Do not merge the pull request. The user will review and merge it.

## Current Codebase Notes

The project already has useful foundations:

- Task CRUD, task listing, task status, assignee, dates, Kanban, table, and calendar views.
- Project performance API through `task.getProjectPerformance`.
- Project documents and a per-document AI chat flow.
- Image upload through `/api/image/upload`.
- AI task extraction from uploaded images through `task.extractTasksFromImage`.
- Bulk task creation through `task.createMany`.
- Existing UI components for tables, dialogs, sheets, tabs, buttons, charts, forms, and upload flows.

Main areas still missing:

- Unified project-level chat assistant.
- Persistent chat history.
- Task comments.
- Comment creation through chat.
- Rich assistant responses using tables, cards, and charts.
- Stronger image-to-task review and assignment flow.
- Safer AI action confirmation before database writes.
- LangChain/LangGraph based assistant workflow.
- RAG pipeline for project tasks and documents.
- Embeddings and vector search.
- Semantic cache for repeated or similar assistant questions.

## AI Architecture Direction

Use a real AI workflow layer instead of keeping all assistant logic inside one tRPC procedure.

Planned AI stack:

- LangChain for model, prompt, retrieval, and tool orchestration primitives.
- LangGraph for multi-step assistant flows and controlled state transitions.
- RAG pipeline for answering questions from project tasks, task comments, and project documents.
- Embeddings for semantic search over documents, tasks, comments, and chat context.
- Vector DB support through PostgreSQL with `pgvector`, if the current database host supports enabling the extension.
- Semantic cache to reuse answers or retrieved context for similar repeated questions.

Important database note:

- The current Prisma datasource uses PostgreSQL.
- PostgreSQL can work as a vector DB when the `pgvector` extension is enabled.
- Prisma does not fully model vector columns as normal scalar fields, so vector columns should usually be represented with `Unsupported("vector(<dimensions>)")` in Prisma and managed with SQL migrations/raw queries where needed.
- If the current database provider does not support `pgvector`, use a separate vector database later.

Assistant flow with LangGraph:

1. Receive user message.
2. Classify intent:
   - project stats
   - task search/list
   - document question
   - graph/progress question
   - task comment action
   - task creation action
   - image-to-task action
3. Retrieve structured project data from PostgreSQL.
4. Retrieve semantic context from vector search when needed.
5. Generate a structured response.
6. If the response proposes a write action, return a confirmation payload instead of writing immediately.
7. On user confirmation, run the validated server-side action.

Semantic cache plan:

- Store normalized question text, embedding, project scope, response type, response payload, model name, and timestamps.
- Search cache by vector similarity before running a new RAG/model call.
- Do not use cached responses for write actions.
- Expire cache entries when related tasks, comments, or documents change.

## Recommended Assistant UI Pattern

Use both cards and tables depending on the user question.

- Use summary cards when the user asks for totals, counts, or percentages.
- Use tables when the user asks to see the actual tasks.
- Use charts when the user asks about project progress, completion percentage, or status distribution.
- Use confirmation cards before the assistant creates tasks, updates tasks, or adds comments.

Example:

- User: "Yuvi, how many tasks are pending, completed, and todo?"
- Assistant response:
  - Cards: total, todo, in progress, in review, done.
  - Optional table: task list grouped or filtered by status.

## Phase 1: Database Foundation

Goal: Add the data models needed for assistant history, task comments, RAG, embeddings, vector search, and semantic cache.

Planned work:

- Add `TaskComment` Prisma model.
- Add `ChatSession` Prisma model.
- Add `ChatMessage` Prisma model.
- Add RAG/vector storage models:
  - `KnowledgeSource`
  - `KnowledgeChunk`
  - `KnowledgeEmbedding`
  - `SemanticCacheEntry`
- Add `pgvector` extension migration if the database supports it.
- Add vector indexes for semantic search where supported.
- Optionally add `TaskAttachment` or image source fields if image-created tasks need traceability.
- Add migrations.
- Regenerate Prisma client.

Expected result:

- Tasks can have comments.
- Assistant conversations can be saved per project and user.
- Future assistant actions can be audited.
- Project documents, task content, and comments can be indexed for RAG.
- Semantic cache can store and reuse similar assistant answers.

Approval gate:

- Confirm exact models, fields, vector dimensions, embedding provider, and whether the database supports `pgvector` before creating the migration.

Suggested branch:

- `feature/assistant-database-foundation`

## Phase 2: Task Comments API And UI

Goal: Let users add, view, and delete task comments.

Planned work:

- Add tRPC procedures:
  - `taskComment.create`
  - `taskComment.getMany`
  - `taskComment.remove`
- Add task comment UI inside the task details dialog.
- Show author name, timestamp, and comment content.
- Support comments created manually and later through chat.

Expected result:

- Users can open a task and manage comments.

Approval gate:

- Confirm whether every project member can comment or only selected roles can comment.

Suggested branch:

- `feature/add-task-comments`

## Phase 3: Project Assistant Backend

Goal: Build the server-side assistant that understands project tasks, documents, comments, RAG context, and progress.

Planned work:

- Add a project assistant router or module.
- Add LangChain/LangGraph dependencies if they are not already installed.
- Create a LangGraph assistant workflow with explicit nodes for:
  - intent classification
  - structured data lookup
  - vector retrieval
  - semantic cache lookup
  - response generation
  - action confirmation
  - confirmed action execution
- Add retrievers for project documents, tasks, and task comments.
- Add embedding generation and re-indexing helpers.
- Implement intent handling for:
  - Task counts by status.
  - List tasks by status, assignee, search term, or due date.
  - Project progress percentage.
  - Project status distribution.
  - Document Q&A.
  - RAG answers over project knowledge.
  - Draft task comments.
  - Draft task creation.
- Use strict Zod schemas for AI output.
- Never let AI directly write to the database without a validated action and user confirmation.

Expected result:

- Assistant can answer project questions using real project data.
- Assistant can return structured response types for the UI.

Approval gate:

- Confirm whether assistant should use deterministic rules first, AI second, or AI for all user messages.
- Confirm LangChain/LangGraph package choices and embedding model.

Suggested branch:

- `feature/project-assistant-backend`

## Phase 4: Project Assistant UI

Goal: Add the assistant chat experience inside the project page.

Planned work:

- Add an `Assistant` tab or right-side assistant drawer.
- Show chat history.
- Render assistant response types:
  - Text answer.
  - Summary cards.
  - Task table.
  - Progress chart.
  - Action confirmation card.
- Add loading and error states.
- Add empty state prompts relevant to project work.

Expected result:

- Users can chat with the project assistant from the project page.

Approval gate:

- Confirm UI placement: new tab, right drawer, floating button, or split panel.

Suggested branch:

- `feature/project-assistant-ui`

## Phase 5: Chat Actions

Goal: Let the assistant perform approved task actions.

Planned work:

- Add comment-through-chat flow:
  - User asks assistant to comment on a task.
  - Assistant identifies the target task.
  - Assistant shows confirmation.
  - User confirms.
  - Server creates the comment.
- Add task creation through chat:
  - Assistant extracts task fields.
  - Assistant shows editable confirmation.
  - User confirms.
  - Server creates the task.
- Add safeguards when multiple tasks match the same name.

Expected result:

- Users can add comments and create tasks from chat safely.

Approval gate:

- Confirm how confirmation should work in UI.

Suggested branch:

- `feature/assistant-chat-actions`

## Phase 6: Image-To-Task Improvements

Goal: Improve the existing image import flow.

Current foundation:

- Image upload exists.
- AI extraction from image exists.
- Review table exists.
- Bulk create tasks exists.

Planned work:

- Add "Assign all to me".
- Add better assignee matching and warnings.
- Store source image URL or source metadata for imported tasks if approved.
- Improve due date and start date extraction.
- Improve review table UX.
- Protect or remove the older public image upload tRPC path if it is not needed.

Expected result:

- User uploads an image with written tasks, reviews extracted tasks, assigns tasks, and creates them.

Approval gate:

- Confirm whether imported tasks should keep a link to the source image.

Suggested branch:

- `feature/improve-image-task-import`

## Phase 7: Document Chat Upgrade

Goal: Move from single-document chat to project-level RAG document understanding.

Planned work:

- Let assistant answer across all project documents.
- Let assistant summarize project documents.
- Let assistant find document references related to tasks.
- Let assistant draft tasks from document content.
- Add chunking and embeddings for documents.
- Add vector retrieval over document chunks.
- Add source/citation metadata in assistant responses where possible.

Expected result:

- Users can ask project-level questions about documents, not only one open document.
- Assistant answers are grounded in retrieved document chunks.

Approval gate:

- Confirm whether assistant should search all documents by default or ask user to choose a document first.

Suggested branch:

- `feature/project-document-assistant`

## Phase 8: QA, Security, And Polish

Goal: Verify the assistant is safe, reliable, and usable.

Planned work:

- Verify every assistant route checks project access.
- Validate all AI outputs with Zod.
- Add tests for task status counts, task comment creation, image extraction normalization, assistant action parsing, RAG retrieval, and semantic cache behavior.
- Verify semantic cache invalidates when project data changes.
- Verify vector retrieval never leaks data across projects or organizations.
- Run:
  - `npx prisma generate`
  - `npm run lint`
  - `npm run build`
- Run a Chrome smoke test against `http://localhost:3000` for affected UI flows and check the browser console for errors.
- Fix UI layout issues on desktop and mobile.

Expected result:

- Feature is production-ready enough for user review.

Approval gate:

- Confirm final acceptance criteria before opening the last polish PR.

Suggested branch:

- `feature/assistant-qa-polish`

## Phase 9: Task Details Drawer Upgrade

Goal: Improve the task details experience after the main assistant phases are complete by replacing the centered task details dialog with a right-side drawer/sheet.

Decision:

- Do not create a separate task details page yet.
- Use a right-side task details drawer on desktop.
- Use a full-screen drawer on mobile.
- Keep a full task details page as a future option only if tasks later need shareable URLs, attachments, subtasks, linked documents, or deeper activity history.

Planned work:

- Replace the current centered task details dialog with a task details sheet/drawer.
- Use a sticky drawer header with task title, status, close action, and task actions.
- Keep task metadata compact near the top: assignee, due date, project, status, and description.
- Render comments as a scrollable activity section.
- Keep the add-comment composer easy to reach without hiding the existing comment list.
- Ensure the drawer works well from table, Kanban, calendar, and sidebar task entry points.
- Verify desktop and mobile layouts in Chrome.

Expected result:

- Users can inspect task details and comments without losing project context.
- The UI has more room for comments and future task activity features.
- The project page remains the primary workflow surface.

Approval gate:

- Confirm drawer width, mobile behavior, and whether task editing stays in the existing edit form or moves into the drawer.

Suggested branch:

- `ui-fix/upgrade-task-details-drawer`

## MVP Order

The fastest useful MVP is:

1. Database foundation.
2. Task comments API and UI.
3. Project assistant backend for task counts, lists, and progress.
4. Project assistant UI with cards, tables, and charts.
5. Add comment-through-chat.
6. Improve image-to-task import.
7. Upgrade document chat to project-level document chat.

## Questions To Ask Before Each Phase

Before starting a phase, ask:

1. What exact scope should be included in this phase?
2. What should be excluded from this phase?
3. What is the approval branch name?
4. What manual checks or tests should pass before opening the PR?
5. Are there any UI preferences for this phase?

## Definition Of Done For Each Phase

A phase is done only when:

- The implementation matches the approved plan.
- The code follows the current project structure and patterns.
- Database migrations are included when needed.
- The feature is manually verified.
- Chrome manual verification is completed for affected UI or local app flows, including a browser console error check.
- Automated checks are run where possible.
- A pull request is created.
- The PR is not merged by the assistant.
