import { format } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { cn } from "@/lib/utils";
import type { Task } from "../types";
import { MemberAvatar, ProjectAvatar, TaskActions } from "./project-by-id";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  const assigneeName =
    task.assignee?.name ?? task.assignee?.email ?? "Unassigned";
  const startDate = task.startDate ? format(task.startDate, "MMM dd") : null;
  const endDate = task.endDate ? format(task.endDate, "MMM dd, yyyy") : null;
  const dueDate = task.dueDate ? format(task.dueDate, "MMM dd, yyyy") : null;
  const dateText =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : (endDate ?? dueDate ?? "No date");

  return (
    <article className="bg-card p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <div className="flex flex-col gap-3">
          <p className=" line-clamp-2">{task.name}</p>

          {task.description && (
            <p className=" text-xs line-clamp-3">{task.description}</p>
          )}
        </div>
        <TaskActions initialState={task} initialData={task}>
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0  transition" />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar name={assigneeName} fallbackClassName="text-[10px]" />
        <div className="size-1 rounded-full bg-neutral-300" />
        <span className={cn("truncate text-xs")}>{dateText}</span>
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          fallbackClassName="text-[10px]"
        />
        <span className="text-xs font-medium">{task.project.name}</span>
      </div>
    </article>
  );
};
