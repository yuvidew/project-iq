"use client";

import { SearchBox } from "@/components/search_box";
import {
    EllipsisVerticalIcon,
    ExternalLinkIcon,
    FileTextIcon,
    PackageOpenIcon,
    PlusIcon,
    SaveIcon,
    SendIcon,
    SparklesIcon,
    Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import { Editor } from "./editor";
import {
    useCreateDocument,
    useGetDocuments,
    useRemoveDocument,
    useUpdateDocument,
} from "../hooks/use-task";
import { useParams } from "next/navigation";
import { useCreateDocumentDialog } from "../hooks/use-create-document";
import { toast } from "sonner";

import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { format } from "date-fns";
import { useDocumentParams } from "../hooks/use-taks-params";

export const ProjectDocumentsErrorView = () => {
    return <ErrorView message="Error loading documents of projects" />;
};

export const ProjectDocumentsLoadingView = () => {
    return <LoadingView message="Loading documents of projects..." />;
};

const AiChatBox = () => {
    // TODO: implement chat box functionality
    return (
        <Popover >
            <PopoverTrigger asChild>
                <Button variant="outline" size={"icon-sm"}>
                    <SparklesIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-md">
                <div className="bg-accent py-5 px-5 flex items-center gap-2">
                    <Button variant="outline" size={"icon-sm"}>
                        <SparklesIcon />
                    </Button>

                    <div className="flex flex-col ">
                        <h3 className="font-semibold text-sm">Chat Assistant</h3>
                        <p className="text-xs text-blue-100">Always here to help</p>
                    </div>
                </div>
                <div className="p-3 px-5">
                    <p>This the chat box</p>
                </div>
                <div className=" p-4">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            // value={input}
                            // onChange={(e) => setInput(e.target.value)}
                            // onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2.5 border  rounded-lg focus:outline-none  resize-none text-sm"
                        // disabled={isLoading}
                        />
                        <Button
                            // onClick={handleSendMessage}
                            // disabled={isLoading || !input.trim()}
                            className="rounded-lg transition-colors flex items-center justify-center"
                            size="icon-sm"
                        >
                            <SendIcon />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const DocumentDetail = () => {
    const { open, setOpen, document, setDocument, isUpdate } =
        useCreateDocumentDialog();

    const { mutate: onCreateDoc, isPending } = useCreateDocument();

    const { mutate: onUpdateDoc, isPending: isUpdating } = useUpdateDocument();

    const { id } = useParams<{ id?: string }>();

    const onSubmit = () => {
        if (!document.name || !document.document) {
            toast.error("Please fill all the fields");
            return;
        }

        if (!id) {
            toast.error("Project ID is missing");
            return;
        }

        if (isUpdate) {
            onUpdateDoc(
                {
                    name: document.name,
                    id: document.id || "",
                    document: document.document,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                        setDocument({
                            name: "Untitled Document",
                            projectId: "",
                            document: "",
                            isEdit: true,
                        });
                    },
                },
            );
            return;
        }

        onCreateDoc(
            {
                name: document.name,
                projectId: id || "",
                document: document.document,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setDocument({
                        name: "Untitled Document",
                        projectId: "",
                        document: "",
                        isEdit: true,
                    });
                },
            },
        );
    };

    const onCancel = () => {
        if (isUpdate) {
            setDocument({
                name: document.name,
                projectId: document.projectId,
                document: document.document,
                id: document.id,
                isEdit: document.isEdit,
            });
            setOpen(false);
            return;
        }
        setDocument({
            name: "Untitled Document",
            projectId: "",
            document: "",
            isEdit: true,
        });
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className=" text-lg">
                        {document.isEdit ? "Create New Document" : "View Document"}</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3 px-3">
                    <Input
                        placeholder="Document Title"
                        className="mb-4 w-full font-semibold border-none dark:bg-transparent text-3xl! bg-transparent outline-none ring-0 focus:ring-0"
                        value={document.name}
                        readOnly={!document.isEdit}
                        onChange={(e) => setDocument({ ...document, name: e.target.value })}
                    />
                    <Editor
                        isEditable={document.isEdit}
                        value={document.document}
                        onChange={(value) => setDocument({ ...document, document: value })}
                    />
                </div>

                <SheetFooter className="flex flex-row justify-end ">
                    {document.isEdit ? (
                        <>
                            <Button variant={"outline"} onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={onSubmit} disabled={isPending || isUpdating}>
                                {isPending || isUpdating ? (
                                    <>
                                        <Spinner className="size-4 mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="size-4 " />
                                        Save
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <AiChatBox />
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

interface DocumentsSearchAndCreateBtnProps {
    isCreateDoc?: boolean;
}

export const DocumentsSearchAndCreateBtn = ({ isCreateDoc }: DocumentsSearchAndCreateBtnProps) => {
    const { setOpen, setDocument } = useCreateDocumentDialog();

    return (
        <div className="flex items-center justify-between">
            <SearchBox placeholder="Search document.." />

            {isCreateDoc && (
                <Button onClick={() => {
                    setOpen(true)
                    setDocument({
                        name: "Untitled Document",
                        projectId: "",
                        document: "",
                        isEdit: true,
                    });
                }}>
                    <PlusIcon className="size-5" />
                    Create Docs
                </Button>
            )}
        </div>
    );
};

interface EmptyProjectDocProps extends DocumentsSearchAndCreateBtnProps { };

const EmptyProjectDoc = ({ isCreateDoc }: EmptyProjectDocProps) => {
    const { setOpen, setDocument } = useCreateDocumentDialog();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpenIcon className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No data</EmptyTitle>
                <EmptyDescription>No data found</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                {isCreateDoc && (
                    <Button onClick={() => {
                        setOpen(true)
                        setDocument({
                            name: "Untitled Document",
                            projectId: "",
                            document: "",
                            isEdit: true,
                        });
                    }}>
                        <PlusIcon className="size-5" />
                        Create Docs
                    </Button>
                )}
            </EmptyContent>
        </Empty>
    );
};

const DocumentsPagination = () => {
    const { data, isFetching } = useGetDocuments();

    const [params, setParams] = useDocumentParams();

    if (!data) {
        return null;
    }

    return (
        <Pagination
            disabled={isFetching}
            page={data?.meta.page}
            totalPages={data?.meta.totalPages}
            onPageChange={(page) =>
                setParams({
                    ...params,
                    page,
                })
            }
        />
    );
};

export const DocumentLists = () => {
    const { data: documents, isFetching, isError } = useGetDocuments();

    const { mutate: removeDocument, isPending: isRemoving } = useRemoveDocument();

    const { setOpen, setDocument, setIsUpdate } = useCreateDocumentDialog();

    const onRemoveDoc = (docId: string) => {
        removeDocument(
            { id: docId },
            {
                onSuccess: () => {
                    toast.success("Document removed successfully");
                },
            },
        );
    };

    return (
        <section className=" flex flex-col gap-8 pt-5">
            {/* start to search box  and create button */}
            <DocumentsSearchAndCreateBtn isCreateDoc={documents?.canEdit} />
            {/* end to search box and create button */}

            {/* start to list  */}
            <div className=" flex flex-col gap-5">
                {isError && <ProjectDocumentsErrorView />}
                {isFetching && <ProjectDocumentsLoadingView />}
                {!isFetching && documents?.documents.length === 0 && (
                    <EmptyProjectDoc isCreateDoc={documents?.canEdit} />
                )}
                {!isFetching &&
                    documents?.documents.map((doc) => (
                        <Card
                            key={doc.id}
                            className={
                                " rounded-sm flex flex-row items-center justify-between p-4 " +
                                (isRemoving ? "opacity-50 pointer-events-none" : "")
                            }
                        >
                            <div className="flex items-start w-full">
                                <Button variant={"default"} size="icon-sm">
                                    <FileTextIcon />
                                </Button>
                                <CardHeader className=" w-full py-0">
                                    <CardTitle>{doc.name}</CardTitle>
                                    <CardDescription className=" text-xs">
                                        Created {format(new Date(doc.createdAt), "MMM dd, yyyy")}
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
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setOpen(true);
                                            setIsUpdate(true);
                                            setDocument({
                                                name: doc.name,
                                                projectId: doc.projectId,
                                                document: doc.document,
                                                id: doc.id,
                                                isEdit: doc.isEdit,
                                            });
                                        }}
                                    >
                                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                                        Document Details
                                    </DropdownMenuItem>

                                    {doc.isEdit && (
                                        <DropdownMenuItem
                                            disabled={isRemoving}
                                            className="text-amber-700 focus:text-amber-700 font-medium p-2.5 cursor-pointer"
                                            onClick={() => onRemoveDoc(doc.id)}
                                        >
                                            <Trash2Icon className="size-4 mr-2 stroke-2" />
                                            Delete document
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Card>
                    ))}
            </div>
            {/* end to list  */}

            {/* start to pagination */}
            <DocumentsPagination />
            {/* end to pagination */}

            <DocumentDetail />
        </section>
    );
};
