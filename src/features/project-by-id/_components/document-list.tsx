import { SearchBox } from "@/components/search_box";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EllipsisVerticalIcon, ExternalLinkIcon, FileTextIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";

export const DocumentsSearch = () => {
    return (
        <SearchBox placeholder="Search.." />
    );
};

const DocumentsPagination = () => {

    return (
        <Pagination
            // disabled={isFetching}
            page={1}
            totalPages={5}
            onPageChange={() => {}}
        />
    );
};

export const DocumentLists = () => {
    return (
        <section className=" flex flex-col gap-8">
            {/* start to search box */}
            <DocumentsSearch  />
            {/* end to search box */}

            {/* start to list  */}
            <div className=" flex flex-col gap-5">
                <Card className=" rounded-sm flex flex-row items-center justify-between p-4 ">
                    <div className="flex items-start w-full">
                        <Button variant={"default"} size="icon-sm">
                            <FileTextIcon />
                        </Button>
                        <CardHeader className=" w-full py-0">
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription className=" text-xs">
                                Created 2 days ago
                            </CardDescription>
                        </CardHeader>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <EllipsisVerticalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                className="font-medium p-2.5 cursor-pointer"
                            >
                                <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                                Document Details
                            </DropdownMenuItem> 
                            {/* TODO: if User is the admin  */}
                            <DropdownMenuItem
                                className="font-medium p-2.5 cursor-pointer"
                            >
                                <PencilIcon className="size-4 mr-2 stroke-2" />
                                Edit document
                            </DropdownMenuItem>
                            {/* TODO: if User is the admin  */}
                            <DropdownMenuItem
                                // disabled={isPending}
                                className="text-amber-700 focus:text-amber-700 font-medium p-2.5 cursor-pointer"
                            >
                                <Trash2Icon className="size-4 mr-2 stroke-2" />
                                Delete document
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Card>
            </div>
            {/* end to list  */}

            {/* start to pagination */}
                <DocumentsPagination/>
            {/* end to pagination */}
        </section>
    );
};
