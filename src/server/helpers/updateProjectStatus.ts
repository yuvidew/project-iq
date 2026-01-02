import { ProjectStatus, TaskStatus } from "@/generated/prisma";
import prisma from "@/lib/db"

export const updateProjectStatus = async (projectId: string) => {
    const tasks = await prisma.task.findMany({
        where: { projectId },
        select: { status: true },
    });

    // if tasks is empty so status is planning
    if (tasks.length === 0) {
        return prisma.project.update({
            where: { id: projectId },
            data: { status: ProjectStatus.PLANNING },
        });
    };

    const statues = tasks.map(t => t.status);

    const allDone = statues.every(s => s === TaskStatus.DONE);
    const hasInProgress = statues.some(
        s => s === TaskStatus.IN_PROGRESS || s === TaskStatus.IN_REVIEW
    );

    const hasTodoOrBacklog = statues.some(
        s => s === TaskStatus.TODO || s === TaskStatus.BACKLOG
    );

    let nextStatus: ProjectStatus;

    // If task is don then project is completed
    if (allDone) {
        nextStatus = ProjectStatus.COMPLETED;
    }

    // If Task status if active work then project is in Progress
    else if (hasInProgress) {
        nextStatus = ProjectStatus.IN_PROGRESS;
    }

    // 4️if Tasks exist but not started → ACTIVE
    else if (hasTodoOrBacklog) {
        nextStatus = ProjectStatus.ACTIVE;
    }

    // If Fallback (future-proof)
    else {
        nextStatus = ProjectStatus.ON_HOLD;
    }

    return prisma.project.update({
        where: { id: projectId },
        data: { status: nextStatus },
    });

}