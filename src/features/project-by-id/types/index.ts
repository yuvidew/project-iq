import { TaskStatus } from "@/generated/prisma";

export type Task = {
    description: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    status: TaskStatus;
    projectId: string;
    assigneeId: string | null;
    assignee?: {
        email: string;
        id: string;
        name: string | null;
        image: string | null;
    } | null;
    dueDate: Date | null;
    position: number;
}
