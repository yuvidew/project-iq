import React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { TaskStatus } from "@/generated/prisma";
import { Task } from "../types";
import { MemberAvatar, ProjectAvatar } from "./project-by-id";

type EventCardProps = {
  id: string;
  title: string;
  assignee: Task["assignee"];
  project: Task["project"];
  status: TaskStatus;
};

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-400",
  [TaskStatus.TODO]: "border-l-red-400",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-400",
  [TaskStatus.IN_REVIEW]: "border-l-blue-400",
  [TaskStatus.DONE]: "border-l-emerald-400",
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
}: EventCardProps) => {
  // const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee?.name ?? "Unassigned"} />
          <div className="size-1 rounded-full bg-neutral-300" />
          <ProjectAvatar name={project?.name ?? "Project"} />
        </div>
      </div>
    </div>
  );
};
