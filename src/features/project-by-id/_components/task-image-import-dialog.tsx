"use client";

import { AlertCircleIcon, ImageUpIcon, SparklesIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useUploadImage } from "@/features/image/hooks/use-upload-image-hook";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { TaskStatus } from "@/generated/prisma";
import {
  useCreateManyTasks,
  useExtractTasksFromImage,
} from "../hooks/use-task";

type ImportedTaskRow = {
  id: string;
  selected: boolean;
  name: string;
  description?: string;
  status: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  assigneeId: string | null;
  assigneeText?: string;
  confidence?: number;
  warnings: string[];
};

interface TaskImageImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "Backlog",
  [TaskStatus.TODO]: "To do",
  [TaskStatus.IN_PROGRESS]: "In progress",
  [TaskStatus.IN_REVIEW]: "In review",
  [TaskStatus.DONE]: "Completed",
};

const toDate = (value?: Date | string | null) => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

export const TaskImageImportDialog = ({
  open,
  onOpenChange,
  projectId,
}: TaskImageImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportedTaskRow[]>([]);
  const { data: membersList, isLoading: isLoadingMembers } = useOrgMembers();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: extractTasks, isPending: isExtracting } =
    useExtractTasksFromImage();
  const { mutateAsync: createManyTasks, isPending: isCreating } =
    useCreateManyTasks();

  useEffect(() => {
    if (!open) {
      setFile(null);
      setRows([]);
    }
  }, [open]);

  const isBusy = isUploading || isExtracting || isCreating;
  const selectedRows = rows.filter((row) => row.selected && row.name.trim());

  const updateRow = <Key extends keyof ImportedTaskRow>(
    id: string,
    key: Key,
    value: ImportedTaskRow[Key],
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [key]: value } : row,
      ),
    );
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setRows([]);
  };

  const onScanImage = async () => {
    if (!file) return;

    const uploaded = await uploadImage({
      file,
      altText: `Task import image: ${file.name}`,
    });

    const extracted = await extractTasks({
      projectId,
      imageUrl: uploaded.url,
      fileName: file.name,
    });

    setRows(
      extracted.tasks.map((task, index) => ({
        id: `${Date.now()}-${index}`,
        selected: true,
        name: task.name,
        description: task.description ?? "",
        status: task.status ?? TaskStatus.TODO,
        startDate: toDate(task.startDate),
        endDate: toDate(task.endDate),
        assigneeId: task.assigneeId ?? null,
        assigneeText: task.assigneeText ?? undefined,
        confidence: task.confidence ?? undefined,
        warnings: task.warnings ?? [],
      })),
    );
  };

  const onCreateTasks = async () => {
    if (!selectedRows.length) return;

    await createManyTasks({
      projectId,
      tasks: selectedRows.map((row) => ({
        name: row.name.trim(),
        description: row.description?.trim() || undefined,
        status: row.status,
        assigneeId: row.assigneeId,
        startDate: row.startDate,
        endDate: row.endDate,
      })),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import tasks from image</DialogTitle>
          <DialogDescription>
            Upload a task list image, review the AI results, then create
            selected tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="task-image-import"
              >
                Task image
              </label>
              <Input
                id="task-image-import"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isBusy}
                onChange={onFileChange}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!file || isBusy}
              onClick={onScanImage}
            >
              {isUploading || isExtracting ? (
                <Spinner />
              ) : rows.length ? (
                <SparklesIcon className="size-4" />
              ) : (
                <ImageUpIcon className="size-4" />
              )}
              {rows.length ? "Scan again" : "Scan image"}
            </Button>
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Use</TableHead>
                    <TableHead className="min-w-48">Title</TableHead>
                    <TableHead className="min-w-48">Assignee</TableHead>
                    <TableHead className="min-w-40">Start</TableHead>
                    <TableHead className="min-w-40">End</TableHead>
                    <TableHead className="min-w-40">Status</TableHead>
                    <TableHead className="min-w-64">Description</TableHead>
                    <TableHead className="min-w-56">Warnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={row.selected}
                          onCheckedChange={(checked) =>
                            updateRow(row.id, "selected", Boolean(checked))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.name}
                          onChange={(event) =>
                            updateRow(row.id, "name", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.assigneeId ?? "unassigned"}
                          onValueChange={(value) =>
                            updateRow(
                              row.id,
                              "assigneeId",
                              value === "unassigned" ? null : value,
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {isLoadingMembers ? (
                              <SelectItem value="loading" disabled>
                                Loading members...
                              </SelectItem>
                            ) : (
                              membersList?.map(({ email, id }) => (
                                <SelectItem key={id} value={id}>
                                  {email}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {row.assigneeText && !row.assigneeId ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Image: {row.assigneeText}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          defaultDate={row.startDate}
                          onSelectDate={(date) =>
                            updateRow(row.id, "startDate", date)
                          }
                          placeholder="Start date"
                        />
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          defaultDate={row.endDate}
                          onSelectDate={(date) =>
                            updateRow(row.id, "endDate", date)
                          }
                          placeholder="End date"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.status}
                          onValueChange={(value) =>
                            updateRow(row.id, "status", value as TaskStatus)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TaskStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusLabels[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          className="min-h-24 resize-none"
                          value={row.description ?? ""}
                          onChange={(event) =>
                            updateRow(row.id, "description", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {typeof row.confidence === "number" ? (
                            <p>
                              {Math.round(row.confidence * 100)}% confidence
                            </p>
                          ) : null}
                          {row.warnings.map((warning) => (
                            <p
                              key={warning}
                              className="flex gap-1 text-amber-600"
                            >
                              <AlertCircleIcon className="mt-0.5 size-3 shrink-0" />
                              <span>{warning}</span>
                            </p>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Select an image and scan it to review extracted tasks.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedRows.length || isBusy}
            onClick={onCreateTasks}
          >
            {isCreating ? <Spinner /> : <SparklesIcon className="size-4" />}
            Create {selectedRows.length} tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
