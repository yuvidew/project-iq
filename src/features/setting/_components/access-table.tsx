"use client"

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeRole } from "@/components/ui/badge-role";
import { organizationMembers } from "../types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

// Dummy data for testing
const dummyData: organizationMembers[] = [
    {
        id: 1,
        role: "OWNER",
        user: {
            id: "user-1",
            name: "John Doe",
            email: "john.doe@example.com",
            image: null,
        },
    },
    {
        id: 2,
        role: "ADMIN",
        user: {
            id: "user-2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            image: "https://avatars.githubusercontent.com/u/1234567",
        },
    },
    {
        id: 3,
        role: "MEMBER",
        user: {
            id: "user-3",
            name: "Bob Wilson",
            email: "bob.wilson@example.com",
            image: null,
        },
    },
    {
        id: 4,
        role: "MEMBER",
        user: {
            id: "user-4",
            name: null,
            email: "alice.johnson@example.com",
            image: null,
        },
    },
];

export const columns: ColumnDef<organizationMembers>[] = [

    {
        accessorKey: "user",
        header: "MEMBER",
        cell: ({ row }) => {
            const user = row.original.user;
            const display = user?.name || user?.email || "Unknown";
            return (
                <div className="capitalize flex items-center gap-2">
                    <Avatar>
                        {user?.image ? (
                            <AvatarImage src={user.image} alt={display} />
                        ) : (
                            <AvatarFallback className="text-sm">
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
        accessorKey: "user.email",
        header: "EMAIL",
        cell: ({ row }) => {
            const email = row.original.user?.email;
            return (
                <div className="lowercase">{email || "No email"}</div>
            );
        },
    },
    {
        accessorKey: "role",
        header: "ROLE",
        cell: ({ row }) => {
            const role = row.original.role as "OWNER" | "ADMIN" | "MEMBER";
            return <BadgeRole role={role} />;
        },
    },
];

interface AccessMemberTableProps {
    data: organizationMembers[] | undefined;
    isLoading: boolean;
}

export const AccessMemberTable = ({ data, isLoading }: AccessMemberTableProps) => {

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Loading state
    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>MEMBER</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>ROLE</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No members found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    There are no members in this organization yet.
                </p>
            </div>
        );
    }

    return (
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
                {table.getRowModel().rows.map((row) => (
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
                ))}
            </TableBody>
        </Table>
    )
}