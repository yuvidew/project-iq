import { Project as BaseProject } from "@/features/projects/types";
import { TaskStatus } from "@/generated/prisma";

type ProjectCount = {
    members: number;
};

export type Project = BaseProject & {
    _count?: ProjectCount;
};


type TaskProject = {
    id: string;
    name: string;
};

type TaskAssignee = {
    id: string;
    email: string;
    name: string | null;
};

export type Task = {
    id: string;
    name: string;
    description: string | null;
    status: TaskStatus;
    position: number;
    dueDate?: Date | null; // ISO date string
    projectId: string;
    assigneeId?: string | null;
    createdAt: Date; // ISO date string
    updatedAt: Date; // ISO date string
    project: TaskProject;
    assignee?: TaskAssignee | null;
};

