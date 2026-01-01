"use client"


import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type Row,
} from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReactNode, useState } from "react"
import { format } from 'date-fns';
import { Task } from "../types"
import { TaskStatus } from "@/generated/prisma"
import { MoreHorizontalIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskForm } from "../hooks/use-task-form";
import { TaskActions } from "./project-by-id";

const EditTask = ({ task }: { task: Task }) => {
    const { setOpen, setInitialState } = useTaskForm();
    return (
        <Button
            onClick={() => {
                setInitialState(task);
                setOpen(true);
            }}
            variant={"ghost"}
            size={"icon"}
        >
            <SquarePenIcon />
        </Button>
    )
}



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
            // <div className=" capitalize ">{row.getValue("status")}</div>
            <Select value={row.getValue("status") as TaskStatus}>
                <SelectTrigger >
                    <SelectValue placeholder="All Statues" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="TODO">Todo</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
            </Select>
        ),
    },
    {
        accessorKey: "assignee",
        header: "ASSIGNEE",
        cell: ({ row }) => {
            const value = row.getValue("assignee") as Task["assignee"] | null;
            const image = value?.image
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
                                    .map(word => word[0])
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
        accessorKey: "position",
        header: "POSITION",
        cell: ({ row }) => <div>{row.getValue("position")}</div>,
    },
    {
        id: "Edit",
        header: "EDIT",
        cell: ({ row }) => (
            <TaskActions initialState={row.original} initialData={row.original}>
                <MoreHorizontalIcon className="size-4 cursor-pointer"  />
            </TaskActions>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

interface Props {
    taskList: Task[],
    searchFilter: ReactNode;
    pagination: ReactNode;
}

export const TaskTable = ({ taskList, searchFilter, pagination }: Props) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

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
    })

    return (
        <section className="w-full flex flex-col gap-6 pt-5">
            {/* start to search */}
            {searchFilter}
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
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
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
                                                cell.getContext()
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
    )
}
