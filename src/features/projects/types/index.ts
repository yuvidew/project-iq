import { ProjectPriority, ProjectStatus } from "@/generated/prisma";

export type Project = {
    description: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    organizationSlug: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    startDate: Date | null;
    endDate: Date | null;
    projectLeadEmail: string | null;
    members: {
        email: string,
    }[]
}