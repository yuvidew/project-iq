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
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { useSuspenseProjects } from "../hooks/use-projects";
import { ProjectCard } from "@/components/project-card";
import { useProjectsParams } from "../hooks/use-projects-params";
import { useProjectSearch } from "../hooks/use-project-search";
import { PAGINATION } from "@/lib/config";

export const ProjectErrorView = () => {
    return <ErrorView message='Error loading projects' />
};

export const ProjectLoadingView = () => {
    return <LoadingView message='Loading projects...' />
};

export const ProjectsSearch = () => {
    return (
        <SearchBox />
    );
};


export const ProjectsPagination = () => {
    const { data, isFetching } = useSuspenseProjects();
    const [params, setParams] = useProjectsParams();

    return (
        <Pagination
            disabled={isFetching}
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setParams({
                ...params,
                page
            })}
        />
    );
};

type ProjectsParams = {
    search: string;
    page: number;
    status?: "PLANNING" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
};

export const FilterSection = () => {
    const [params, setParams] = useProjectsParams() as [
        ProjectsParams,
        (p: ProjectsParams) => void
    ];

    const { searchValue, onSearchChange } = useProjectSearch({ params, setParams });

    const onUpdateFilter = <K extends keyof ProjectsParams>(
        key: K,
        value: ProjectsParams[K] | "ALL"
    ) => {
        const next = { ...params, page: PAGINATION.DEFAULT_PAGE };

        if (value === "ALL" || value === undefined) {
            // Nuqs removes params when the value is null.
            setParams({
                ...next,
                [key]: null,
            } as ProjectsParams);
            return;
        }

        setParams({
            ...next,
            [key]: value as ProjectsParams[K],
        });
    }

    return (
        <section className='flex items-center justify-start gap-2'>
            {/* start to search project */}
            <SearchBox
                placeholder='Search projects...'
                value={searchValue}
                onChange={onSearchChange}
            />
            {/* end to search project */}

            {/* start to status filter */}
            <Select
                value={params.status ?? "ALL"}
                onValueChange={(val) => onUpdateFilter("status", val as ProjectsParams["status"] | "ALL")}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All status</SelectItem>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
            </Select>
            {/* end to status filter */}

            {/* start to status priority */}
            <Select
                value={params.priority ?? "ALL"}
                onValueChange={(val) => onUpdateFilter("priority", val as ProjectsParams["priority"] | "ALL")}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
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
    isCreate?: boolean
}


export const EmptyProjectView = ({
    message,
    empty_label = "No items",
    isCreate = true
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

                {isCreate && (
                    <EmptyContent>
                        <CreateNewProject title="Create new Project" />
                    </EmptyContent>
                )}
            </Empty>
        </div>
    );
};



export const ProjectLists = () => {
    const { data } = useSuspenseProjects();

    if (data.projects.length === 0) {
        return <EmptyProjectView message="" empty_label="No projects yet" isCreate={false} />
    }

    return (
        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 h-full">
            {data.projects.map(({ id, name, description, status, priority, _count, endDate }) => (
                <ProjectCard
                    id = {id}
                    key={id}
                    name={name}
                    description={description}
                    status={status}
                    priority={priority}
                    members={_count.members}
                    endDate={endDate}
                    classname="border border-primary"
                />
            ))}
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
