"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskStatus } from "@/generated/prisma";
import { useRemoveAllTasks } from "../hooks/use-task";
import type { Task } from "../types";
import { TaskActions } from "./project-by-id";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "TITLE",
    cell: ({ row }: { row: Row<Task> }) => (
      <div className=" capitalize ">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div>
        <BadgeTaskStatus
          status={(row.getValue("status") as TaskStatus) ?? "TODO"}
        />
      </div>
    ),
  },
  {
    accessorKey: "assignee",
    header: "ASSIGNEE",
    cell: ({ row }) => {
      const value = row.getValue("assignee") as Task["assignee"] | null;
      const image = value?.image;
      const display = value?.name || value?.email || "Unassigned";
      return (
        <div className=" capitalize flex items-center gap-2">
          <Avatar>
            {image ? (
              <AvatarImage src={image} alt={display} />
            ) : (
              <AvatarFallback className=" text-sm">
                {display
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          {display}
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "START DATE",
    cell: ({ row }: { row: Row<Task> }) => {
      const value = row.getValue("startDate") as Date | null;
      return (
        <div className=" capitalize ">
          {value ? format(value, "MMM dd, yyyy") : "No start date"}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "DUE DATE",
    cell: ({ row }: { row: Row<Task> }) => {
      const value = row.getValue("dueDate") as Date | null;
      return (
        <div className=" capitalize ">
          {value ? format(value, "MMM dd, yyyy") : "No due date"}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "END DATE",
    cell: ({ row }: { row: Row<Task> }) => {
      const value = row.getValue("endDate") as Date | null;
      return (
        <div className=" capitalize ">
          {value ? format(value, "MMM dd, yyyy") : "No end date"}
        </div>
      );
    },
  },
  {
    id: "Edit",
    header: "EDIT",
    cell: ({ row }) => (
      <TaskActions initialState={row.original} initialData={row.original}>
        <MoreHorizontalIcon className="size-4 cursor-pointer" />
      </TaskActions>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

interface Props {
  taskList: Task[];
  searchFilter: ReactNode;
  pagination: ReactNode;
}

export const TaskTable = ({ taskList, searchFilter, pagination }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { mutate: removeAllTasks, isPending: isDeleting } = useRemoveAllTasks();

  const table = useReactTable({
    data: taskList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  const onRemoveSelected = () => {
    if (!selectedIds.length) return;
    removeAllTasks(
      { taskIds: selectedIds },
      {
        onSuccess: () => table.resetRowSelection(),
      },
    );
  };

  return (
    <section className="w-full flex flex-col gap-6 pt-5">
      {/* start to search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {searchFilter}
        <Button
          variant="destructive"
          size="sm"
          disabled={!selectedIds.length || isDeleting}
          onClick={onRemoveSelected}
        >
          {isDeleting ? (
            <>
              <Spinner />
              Removing..
            </>
          ) : (
            `Delete (${selectedIds.length})`
          )}
        </Button>
      </div>
      {/* end to search */}

      {/* <SearchSection /> */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* start to pagination */}
      {pagination}
      {/* end to pagination */}
    </section>
  );
};
