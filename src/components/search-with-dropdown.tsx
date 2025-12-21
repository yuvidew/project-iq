"use client"

import { useMemo, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";



interface Props  {
    list : {
        value : string,
        label : string,
        id : number
    }[],
    isLoading : boolean
}

export const SearchWithDropdown = ({list , isLoading} : Props) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const filteredItems = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return list;
        return list.filter(({value}) => value.toLowerCase().includes(trimmed));
    }, [query, list]);

    const handleSelect = (item: Props["list"][number]) => {
        setQuery(item.value);
        setOpen(false);
        router.push(`/organization/${item.id}`);
    };

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
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && filteredItems[0]) {
                                event.preventDefault();
                                handleSelect(filteredItems[0]);
                            }
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Search items..."
                        className="pl-9 pr-8"
                        disabled={isLoading && !list.length}
                    />
                    {isLoading && (
                        <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                {isLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <Spinner className="size-4" />
                        Loading...
                    </div>
                ) : filteredItems.length ? (
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredItems.map((item) => (
                            <li
                                key={item.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelect(item);
                                }}
                            >
                                {item.label}
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
