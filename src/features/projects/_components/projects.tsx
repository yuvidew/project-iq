import { CreateNewProject } from "@/components/create-new-project";
import { SearchBox } from "@/components/search_box"
import { ReactNode } from "react";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { PackageOpenIcon, PlusIcon } from "lucide-react";
import { BadgeText } from "@/components/ui/badge-text";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/ui/pagination";

export const ProjectsSearch = () => {
    return (
        <SearchBox />
    );
};


export const ProjectsPagination = () => {
    return (
        <Pagination
            // disabled={isFetching}
            page={1}
            totalPages={0}
            onPageChange={() => {}}
        />
    );
};

export const FilterSection = () => {
    return (
        <section className='flex items-center justify-start gap-2'>
            {/* start to search project */}
            <SearchBox placeholder='Search projects...' />
            {/* end to search project */}

            {/* start to status filter */}
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                </SelectContent>
            </Select>
            {/* end to status filter */}

            {/* start to status priority */}
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                </SelectContent>
            </Select>
            {/* end to status priority */}
        </section>
    );
};


interface EmptyProjectViewProps {
    message: string;
    label?: string;
    empty_label?: string;
}


export const EmptyProjectView = ({
    message,
    empty_label = "No items"
}: EmptyProjectViewProps) => {
    return (
        <div className=" w-md m-auto h-96 flex items-center justify-center">
            <Empty className=" border border-dashed border-primary dark:bg-background ">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageOpenIcon />
                    </EmptyMedia>
                    <EmptyTitle>{empty_label}</EmptyTitle>
                    {!!message && <EmptyDescription>{message}</EmptyDescription>}
                </EmptyHeader>

                <EmptyContent>
                    <CreateNewProject title="Create new Project" />
                </EmptyContent>
            </Empty>
        </div>
    );
};

export const ProjectCard = () => {
    return (
        <Card className=" rounded-sm h-56">
            <CardHeader>
                <CardTitle className=" font-semibold">Project IQ</CardTitle>
                <CardDescription className=" text-sm line-clamp-2">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque voluptatum voluptate assumenda? Ipsam repudiandae, repellat odio tenetur nulla, earum dolores et non dolorem in enim dignissimos dolor numquam laboriosam ratione.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className=" flex items-center justify-between">
                    <BadgeText />

                    <p className=" text-muted-foreground text-sm">
                        MEDIUM Priority
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className=" flex items-center w-full justify-between gap-2">
                    <p>Progress</p>

                    <span className=" text-muted-foreground">
                        0%
                    </span>
                </div>
                <Progress status="ACTIVE" />
            </CardFooter>
        </Card>
    )
}

export const ProjectLists = () => {
    return (
        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 h-full">
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
        </section>
    )
}



interface ProjectsWrapperProps {
    pagination: ReactNode;
    filterSection: ReactNode;
    children: ReactNode;
}

export const ProjectsWrapper = ({
    pagination,
    filterSection,
    children
}: ProjectsWrapperProps) => {
    return (
        <main className='p-6 flex flex-col gap-10 h-full '>
            {/* start to header  and create project button */}
            <section className=' flex items-start justify-between'>
                <div className='flex flex-col gap-2'>
                    <h1 className=' text-3xl font-semibold'>
                        Projects
                    </h1>
                    <p className=' text-sm text-muted-foreground'>
                        Manage and track your projects
                    </p>
                </div>

                <CreateNewProject />
            </section>
            {/* end to header  and create project button */}

            {/* start to filter section */}
            {filterSection}
            {/* end to filter section */}

            {/* start to children section */}
            {children}
            {/* end to children section */}

            {/* start to pagination */}
            {pagination}
            {/* end to pagination */}

        </main>
    )
}