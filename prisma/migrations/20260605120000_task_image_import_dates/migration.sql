-- Add task-level scheduling fields for AI image imports and allow unassigned tasks.
ALTER TABLE "Task" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Task" ALTER COLUMN "assigneeId" DROP NOT NULL;