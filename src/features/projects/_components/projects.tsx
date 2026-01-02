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
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


import { ExternalLinkIcon, PackageOpenIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { useRemoveProject, useSuspenseProjects } from "../hooks/use-projects";
import { ProjectCard } from "@/components/project-card";
import { useProjectsParams } from "../hooks/use-projects-params";
import { useProjectSearch } from "../hooks/use-project-search";
import { PAGINATION } from "@/lib/config";
import { ProjectStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { useProjectForm } from "../hooks/use-project-from";
import { Project } from "../types";
import { useRemoveProjectDialog } from "../hooks/use-remove-project-form";
import { Spinner } from "@/components/ui/spinner";

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

export const statusStyles: Record<
    ProjectStatus,
    { value: number }
> = {
    PLANNING: {
        value: 10,
    },
    ACTIVE: {
        value: 30,
    },
    IN_PROGRESS: {
        value: 60,
    },
    ON_HOLD: {
        value: 40,
    },
    COMPLETED: {
        value: 100,
    },
};

const RemoveProjectDialog = () => {
    const { open, setOpen, initialState } = useRemoveProjectDialog();

    const { mutate: onRemoveProject, isPending } = useRemoveProject();

    
    const onConfirmRemove = () => {
        onRemoveProject(
            {
                id: initialState.id as string,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            }
        );
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete Project "{initialState.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Deleting this project will remove all tasks and membership data associated with it.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={isPending} onClick={onConfirmRemove}>
                        {isPending ? (
                            <>
                                <Spinner />
                                Removing...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
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

interface ProjectActionProps {
    children: ReactNode;
    onProjectDetails : () => void;
    initialState : Project;
    
}

export const ProjectActions = ({
    children,
    onProjectDetails,
    initialState,
}: ProjectActionProps) => {
    const {setOpen, setInitialState} = useProjectForm();
    const {setOpen : onOpenRemoveDialog , setInitialState: setRemoveProjectInitialState} = useRemoveProjectDialog();

    return (
        <div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }} className=" cursor-pointer">{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        className="font-medium p-2.5 cursor-pointer"
                        onClick={onProjectDetails}
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Project Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(true);
                            setInitialState(initialState);
                        }}
                        className="font-medium p-2.5 cursor-pointer"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            onOpenRemoveDialog(true);
                            setRemoveProjectInitialState(initialState);
                        }}
                        // disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-2.5 cursor-pointer"
                    >
                        <Trash2Icon className="size-4 mr-2 stroke-2" />
                        Delete Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
                <SelectTrigger className="lg:w-[180px] w-[140px]">
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
                <SelectTrigger className="lg:w-[180px] w-[140px]">
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
    const {setOpen} = useProjectForm();
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
                        <Button onClick={() => setOpen(true)} >
                            Create new Project
                        </Button>
                        {/* <CreateNewProject title="Create new Project" /> */}
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
            {data.projects.map((project) => (
                <ProjectCard
                    key = {project.id}
                    data = {project}
                    className="border border-primary"
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
    const {setOpen} = useProjectForm();
    return (
        <>
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

                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon/>
                        New Project
                    </Button>
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

            {/* start to create project from  */}
            <CreateNewProject/>
            {/* end to create project from  */}

            {/* start to remove dialog  */}
            <RemoveProjectDialog/>
            {/* end to remove dialog  */}
        </>
    )
}
