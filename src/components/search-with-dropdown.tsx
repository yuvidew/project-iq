"use client"

import { useMemo, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

const ITEMS = [
    "Customer onboarding",
    "Workflow approvals",
    "Quarterly reporting",
    "Analytics exports",
    "Incident review",
    "Access requests",
    "Data sync job",
    "Marketing pipeline",
    "Billing reconciliation",
    "Release checklist",
];

export const SearchWithDropdown = () => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const filteredItems = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return ITEMS;
        return ITEMS.filter((item) => item.toLowerCase().includes(trimmed));
    }, [query]);


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-72">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            if (!open) setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Search items..."
                        className="pl-9"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                {filteredItems.length ? (
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredItems.map((item) => (
                            <li
                                key={item}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                                onMouseDown={() => {
                                    setQuery(item);
                                    setOpen(false);
                                }}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                        No matches found.
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
