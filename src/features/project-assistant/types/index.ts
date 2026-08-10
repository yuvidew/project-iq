import z from "zod";
import { AssistantResponseType, TaskStatus } from "@/generated/prisma";

export const assistantToneSchema = z.enum([
  "default",
  "success",
  "warning",
  "danger",
  "info",
]);

export const assistantSummaryCardSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  description: z.string().optional(),
  tone: assistantToneSchema.default("default"),
});

export const assistantTaskRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(TaskStatus),
  statusLabel: z.string(),
  assignee: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      image: z.string().nullable(),
      displayName: z.string(),
    })
    .nullable(),
  dueDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  commentCount: z.number(),
});

export const assistantStatusSegmentSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  label: z.string(),
  value: z.number(),
  percentage: z.number(),
});

export const assistantTextPayloadSchema = z.object({
  title: z.string(),
  items: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const assistantSummaryCardsPayloadSchema = z.object({
  title: z.string(),
  cards: z.array(assistantSummaryCardSchema),
  statusSegments: z.array(assistantStatusSegmentSchema),
});

export const assistantTaskTablePayloadSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tasks: z.array(assistantTaskRowSchema),
  meta: z.object({
    total: z.number(),
    returned: z.number(),
    limit: z.number(),
  }),
  filters: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
});

export const assistantProgressChartPayloadSchema = z.object({
  title: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionPercentage: z.number(),
  statusSegments: z.array(assistantStatusSegmentSchema),
});

export const assistantActionConfirmationPayloadSchema = z.object({
  action: z.enum(["CREATE_TASK", "CREATE_TASK_COMMENT"]),
  title: z.string(),
  description: z.string(),
  requiresConfirmation: z.literal(true),
  payload: z.record(z.string(), z.unknown()),
  warnings: z.array(z.string()).default([]),
});

export const projectAssistantResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(AssistantResponseType.TEXT),
    intent: z.string(),
    answer: z.string(),
    payload: assistantTextPayloadSchema,
  }),
  z.object({
    type: z.literal(AssistantResponseType.SUMMARY_CARDS),
    intent: z.string(),
    answer: z.string(),
    payload: assistantSummaryCardsPayloadSchema,
  }),
  z.object({
    type: z.literal(AssistantResponseType.TASK_TABLE),
    intent: z.string(),
    answer: z.string(),
    payload: assistantTaskTablePayloadSchema,
  }),
  z.object({
    type: z.literal(AssistantResponseType.PROGRESS_CHART),
    intent: z.string(),
    answer: z.string(),
    payload: assistantProgressChartPayloadSchema,
  }),
  z.object({
    type: z.literal(AssistantResponseType.ACTION_CONFIRMATION),
    intent: z.string(),
    answer: z.string(),
    payload: assistantActionConfirmationPayloadSchema,
  }),
  z.object({
    type: z.literal(AssistantResponseType.ERROR),
    intent: z.string(),
    answer: z.string(),
    payload: assistantTextPayloadSchema,
  }),
]);

export type ProjectAssistantResponse = z.infer<
  typeof projectAssistantResponseSchema
>;

export type ProjectAssistantTaskRow = z.infer<typeof assistantTaskRowSchema>;
