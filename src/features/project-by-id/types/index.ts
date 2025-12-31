// import { TaskStatus } from "@/generated/prisma";

export type task =  {
    name: string;
    status: "BACKLOG" | "IN_REVIEW" | "TODO" | "IN_PROGRESS" | "DONE";
    workspaceId: string;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
}