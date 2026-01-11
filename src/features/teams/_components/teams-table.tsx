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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReactNode, useState } from "react"
import { format } from 'date-fns';
import { OrganizationRole, TaskStatus } from "@/generated/prisma"
import { MoreHorizontalIcon } from "lucide-react";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: OrganizationRole;
};

const roleStyles: Record<OrganizationRole, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    MEMBER: "bg-blue-100 text-blue-700",
    OWNER: "bg-green-100 text-green-700",
};

export const RoleBadge = ({ role }: { role: OrganizationRole }) => (
    <span
        className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleStyles[role]}`}
    >
        {role}
    </span>
);




export const columns: ColumnDef<TeamMember>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => {
            const member = row.original;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        {/* <AvatarImage src={member.image ?? ""} /> */}
                        <AvatarFallback>
                            {member.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <span className="capitalize font-medium">{member.name}</span>
                </div>
            );
        },
    },

    {
        accessorKey: "email",
        header: "EMAIL",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.getValue("email")}
            </span>
        ),
    },


    {
        accessorKey: "role",
        header: "ROLE",
        cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
    },

];


interface Props {
    members: TeamMember[];
    searchFilter: ReactNode;
    pagination: ReactNode;
}

export const TeamMembersTable = ({
    members,
    searchFilter,
    pagination,
}: Props) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: members,
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

    return (
        <section className="w-full flex flex-col gap-6 pt-5">
            {/* Search */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                {searchFilter}
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
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
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination}

            
        </section>
    );
};

