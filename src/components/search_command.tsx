"use client";

import {
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandResponsiveDialog,
} from "@/components/ui/command";

import { House } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

interface Props {
    onOpenChange: (value: boolean) => void;
    open: boolean;
    documents: Array<{
        id: string;
        value: string;
        option: string;
    }>;
    isLoading: boolean;
}


/**
 * Command palette dialog for searching and navigating documents.
 * @param onOpenChange Callback invoked when dialog open state changes.
 * @param open Whether the dialog is currently open.
 * @param documents List of searchable documents with id, value, and option metadata.
 * @param isLoading Whether document results are being fetched.
 * @example
 * ```tsx
 * <SearchCommand
 *   open={open}
 *   onOpenChange={setOpen}
 *   isLoading={loading}
 *   documents={[{ id: "docs/1", value: "Getting Started", option: "doc" }]}
 * />
 * ```
 */
export const SearchCommand = ({ onOpenChange, open, documents, isLoading }: Props) => {




    return (
        <CommandResponsiveDialog onOpenChange={onOpenChange} open={open} shouldFilter={false}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Documents">
                    {isLoading
                        ? [1, 2, 3, 4].map((item) => (
                            <Skeleton key={item} className=" h-8 rounded-sm" />
                        ))
                        : documents.map(({ id, value, }) => (
                            <CommandItem
                                key={id}

                            >
                                <Link href={`/${id}`} className="flex items-center gap-3 w-full">
                                    <House />
                                    {value}
                                </Link>
                            </CommandItem>
                        ))
                    }
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    );
};
