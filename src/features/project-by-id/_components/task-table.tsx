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
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
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
import { useState } from "react"
import { format } from 'date-fns';
import { BadgePriority } from "@/components/ui/badge-priority"
import { BadgeTaskType } from "@/components/ui/badge-type"

// TODO: list actual data fetch from api 

export const data: TASK[] = [
    {
        id: 1,
        title: "Fix login bug",
        status: "TODO",
        type: "BUG",
        priority: "HIGH",
        assignee: "yuvraj.dev@example.com",
        due_date: new Date("2025-01-05"),
    },
    {
        id: 2,
        title: "Design dashboard UI",
        status: "IN_PROGRESS",
        type: "FEATURE",
        priority: "MEDIUM",
        assignee: "aman.ui@example.com",
        due_date: new Date("2025-01-10"),
    },
    {
        id: 3,
        title: "API integration",
        status: "IN_PROGRESS",
        type: "TASK",
        priority: "HIGH",
        assignee: "rohit.backend@example.com",
        due_date: new Date("2025-01-07"),
    },
    {
        id: 4,
        title: "Write unit tests",
        status: "TODO",
        type: "IMPROVEMENT",
        priority: "LOW",
        assignee: "neha.qa@example.com",
        due_date: new Date("2025-01-15"),
    },
    {
        id: 5,
        title: "Deploy to production",
        status: "DONE",
        type: "OTHER",
        priority: "HIGH",
        assignee: "admin@example.com",
        due_date: new Date("2025-01-01"),
    },
];


type TASK = {
    id: number,
    title: string,
    status: "BACKLOG" | "IN_REVIEW" | "TODO" | "IN_PROGRESS" | "DONE",
    type: "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER",
    priority: "LOW" | "MEDIUM" | "HIGH",
    assignee: string,
    due_date: Date,
}

export const columns: ColumnDef<TASK>[] = [
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
        accessorKey: "title",
        header: "TITLE",
        cell: ({ row }: { row: Row<TASK> }) => (
            <div className=" capitalize ">{row.getValue("title")}</div>
        ),
    },
    {
        accessorKey: "type",
        header: "TYPE",
        cell: ({ row }) => <BadgeTaskType type={row.getValue("type")} />,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            // <div className=" capitalize ">{row.getValue("status")}</div>
            <Select value={row.getValue("status")}>
                <SelectTrigger >
                    <SelectValue placeholder="All Statues" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TODO">Todo</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
            </Select>
        ),
    },
    {
        accessorKey: "priority",
        header: "PRIORITY",
        cell: ({ row }) => (
            // <div className=" capitalize ">{row.getValue("priority")}</div>
            <BadgePriority priority={row.getValue("priority")} />
        ),
    },
    {
        accessorKey: "assignee",
        header: "ASSIGNEE",
        cell: ({ row }) => <div className=" capitalize ">{row.getValue("assignee")}</div>,
    },
    {
        accessorKey: "due_date",
        header: "DUE DATE",
        cell: ({ row }: { row: Row<TASK> }) => {
            const value = row.getValue("due_date") as Date;

            return <div className=" capitalize ">{format(value, "MMM dd, yyyy")}</div>;
        },
    },
]

export const TaskTable = () => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
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
        <section className="w-full">
            <div className="flex items-center gap-3 py-4">
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Statues" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TODO">Todo</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TASK">Task</SelectItem>
                        <SelectItem value="BUG">Bug</SelectItem>
                        <SelectItem value="FEATURE">Feature</SelectItem>
                        <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                </Select>

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </section>
    )
}
