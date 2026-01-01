import { MoreHorizontalIcon } from "lucide-react";
import { Task } from "../types";
import { MemberAvatar, ProjectAvatar, TaskActions } from "./project-by-id";
import { DottedSeparator } from "@/components/dotted-separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <article className="bg-card p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <div className="flex flex-col gap-3">
          <p className=" line-clamp-2">{task.name}</p>

          {task.description && (
            <p className=" text-xs line-clamp-3">
              {task.description}
            </p>
          )}
        </div>
        <TaskActions initialState={task} initialData={task}>
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0  transition" />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee?.name as string}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-neutral-300" />
        <span className={cn("truncate text-xs")}>{format(task.dueDate as Date, "MMM dd, yyyy")}</span>
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
