# Phase 2: Task Comments API And UI Plan

## Next Phase

The next phase is **Phase 2: Task Comments API And UI**.

Phase 1 database foundation is already present in the current Prisma schema and migration files, including `TaskComment`, assistant chat history, RAG knowledge models, embeddings, and semantic cache tables.

## Goal

Let authenticated project users add, view, and delete comments on tasks from the task details dialog.

## Branch

Use:

```text
feature/add-task-comments
```

## Scope

This phase only covers manual task comments.

Included:

- Add server-side task comment procedures.
- Add client hooks for loading, creating, and deleting comments.
- Add comments UI inside the existing task details dialog.
- Show comment author, timestamp, comment source, and content.
- Invalidate comment queries after create/delete.
- Verify the flow manually in Chrome.

Excluded:

- Assistant-created comments through chat.
- Project assistant UI.
- LangChain/LangGraph assistant routing.
- RAG indexing of comments.
- Semantic cache invalidation.
- Comment editing, reactions, mentions, attachments, or threaded replies.
- PR merge.

## Current Codebase Fit

Relevant existing code:

- `prisma/schema.prisma` already has `TaskComment` and `TaskCommentSource`.
- `src/features/project-by-id/server/routers.ts` currently owns task-related tRPC procedures.
- `src/features/project-by-id/hooks/use-task.ts` currently owns task/document client hooks.
- `src/features/project-by-id/_components/project-by-id.tsx` contains the existing `TaskDetail` dialog.
- `src/features/project-by-id/types/index.ts` defines the local task shape used by task UI.

## Proposed Server Work

Add tRPC procedures, likely under the existing `task` router unless we decide to create a separate `taskComment` router.

Procedures:

- `task.getComments`
  - Input: `taskId`, `projectId`.
  - Return comments ordered oldest-to-newest or newest-to-oldest.
  - Include author `id`, `name`, `email`, `image`.
  - Verify the task belongs to the requested project.
  - Verify the current user can access the project.

- `task.createComment`
  - Input: `taskId`, `projectId`, `content`.
  - Validate trimmed content length.
  - Create comment with `authorId = ctx.auth.user.id` and `source = MANUAL`.
  - Verify the task belongs to the requested project.
  - Verify the current user can access/comment on the project.

- `task.removeComment`
  - Input: `commentId`, `taskId`, `projectId`.
  - Verify comment belongs to task and project.
  - Allow delete by comment author, organization owner/admin, or project lead.

## Proposed UI Work

Update the task detail dialog:

- Add a comments section below task metadata.
- Load comments only when the dialog has a valid task id and is open.
- Show loading, empty, and error states.
- Add a textarea plus submit button for new comments.
- Disable submit while empty or pending.
- Show each comment with author identity, relative/absolute timestamp, source badge, and delete action when allowed.
- Keep the dialog compact and scrollable so task content and comments do not overflow on smaller screens.

## Data And Permission Decision

Recommended default:

- Every authenticated project member can view and create comments.
- Comment authors can delete their own comments.
- Organization owners/admins and project leads can delete any comment in the project.

Open approval question:

- Should every project member be allowed to comment, or should comments be limited to owners/admins/project leads?

## Verification Plan

Run:

```powershell
npx.cmd prisma validate
npm run lint
npm run build
```

Manual Chrome checks:

- Open a project task details dialog.
- Add a comment.
- Confirm the comment appears without reopening the page.
- Close and reopen the task details dialog and confirm the comment persists.
- Delete an allowed comment and confirm it disappears.
- Confirm an empty comment cannot be submitted.
- Check the browser console for errors.

## Definition Of Done

- The implementation follows existing project feature/router/hook patterns.
- Comment routes enforce task/project access checks.
- Manual comments are created with `TaskCommentSource.MANUAL`.
- Task details dialog renders comments cleanly on desktop and mobile widths.
- Automated checks and Chrome manual verification pass.
- A PR is opened from `feature/add-task-comments` and not merged by the assistant.

