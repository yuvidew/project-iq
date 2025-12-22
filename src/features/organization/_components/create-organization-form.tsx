"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import slugify from "slugify";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUploadImage } from "@/features/image/hooks/use-upload-image-hook";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useCreateOrganization, useUpdateOrganization } from "../hooks/use-organization";

const OrganizationFormSchema = z.object({
    name: z.string().min(2, { message: "Organization name must be at least 2 characters." }).max(100, { message: "Organization name must be at most 100 characters." }),
    description: z.string().max(500, { message: "Description must be at most 500 characters." }).optional(),
    slug: z.string().min(2, { message: "Slug must be at least 2 characters." }).max(50, { message: "Slug must be at most 50 characters." }),
    logoUrl: z.string().url().optional(),
});

type OrganizationFormValue = z.infer<typeof OrganizationFormSchema>;

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialData?: {
        id?: number;
        name: string;
        description?: string | null;
        slug: string;
        logoUrl?: string | null;
    };
}

export const CreateOrganizationForm = ({ open, setOpen, initialData }: Props) => {
    const { mutate: onUploadImage, data: uploadImageData, isPending: isUploadingImage } = useUploadImage();
    const { mutate: onCreateOrganization, isPending: isCreatingOrganization } = useCreateOrganization();
    const { mutate: onUpdateOrganization, isPending: isUpdatingOrganization } = useUpdateOrganization();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const slugManuallyEdited = useRef(false);

    const isEdit = !!initialData?.id;

    const form = useForm<OrganizationFormValue>({
        resolver: zodResolver(OrganizationFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            slug: initialData?.slug || "",
            logoUrl: initialData?.logoUrl || "",
        },
    });

    useEffect(() => {
        form.reset({
            name: initialData?.name || "",
            description: initialData?.description || "",
            slug: initialData?.slug || "",
            logoUrl: initialData?.logoUrl || "",
        });
        slugManuallyEdited.current = false;
    }, [initialData, form]);

    const nameValue = form.watch("name");

    // Auto-generate slug from name when creating
    useEffect(() => {
        if (!nameValue || isEdit) return;

        if (!slugManuallyEdited.current) {
            const generatedSlug = slugify(nameValue, {
                lower: true,
                strict: true,
                trim: true,
            });

            form.setValue("slug", generatedSlug, {
                shouldValidate: true,
            });
        }
    }, [nameValue, form, isEdit]);

    // Set logoUrl when image upload completes
    useEffect(() => {
        if (uploadImageData?.url) {
            form.setValue("logoUrl", uploadImageData.url, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [uploadImageData?.url, form]);

    // Handle image file selection
    const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        onUploadImage({
            file,
        });
        if (fileInputRef.current?.value) {
            fileInputRef.current.value = "";
        }
    };

    // Handle organization creation / update form submission
    const handleOrganizationCreation = (data: OrganizationFormValue) => {
        const payload = {
            name: data.name,
            description: data.description || undefined,
            slug: data.slug,
            logoUrl: data.logoUrl || undefined,
        };

        if (isEdit && initialData?.id) {
            onUpdateOrganization(
                {
                    organizationId: initialData.id,
                    name: payload.name,
                    description: payload.description,
                    logoUrl: payload.logoUrl,
                },
                {
                    onSuccess: () => {
                        form.reset();
                        setOpen(false);
                    },
                }
            );
            return;
        }

        onCreateOrganization(payload, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const isAllFieldsFilled = Boolean(form.getValues("name") && form.getValues("slug"));
    const isSubmitting = isCreatingOrganization || isUpdatingOrganization;
    const logoPreview = uploadImageData?.url || form.watch("logoUrl");

    return (
        <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
            <DialogContent className=" gap-10">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Update Organization " : "Create New Organization"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update your organization" : "Fill in the details below to create a new organization."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className=" flex flex-col gap-5" onSubmit={form.handleSubmit(handleOrganizationCreation)}>
                        <div className="">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                id="organization-image"
                                className=" hidden"
                                onChange={onChangeImage}
                            />
                            <label htmlFor="organization-image" className=" cursor-pointer">
                                <div className={cn("size-24 rounded-md bg-muted overflow-hidden flex items-center justify-center", logoPreview ? "border border-primary" : "")}>
                                    {isUploadingImage ? (
                                        <Spinner className="text-primary" />
                                    ) : logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Organization logo"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UploadIcon className="size-5 text-primary" />
                                    )}
                                </div>
                            </label>
                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Organization Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="slug"
                                                type="text"
                                                placeholder="Organization Slug"
                                                {...field}
                                                disabled={isEdit}
                                                onChange={(e) => {
                                                    slugManuallyEdited.current = true;
                                                    field.onChange(e);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="description"
                                                placeholder="Organization Description"
                                                {...field}
                                                className=" h-28 resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <DialogClose asChild>
                                <Button
                                    disabled={isSubmitting}
                                    type="button"
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={!isAllFieldsFilled || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner />
                                        {isEdit ? "Updating org.." : "Creating org..."}
                                    </>
                                ) :
                                    isEdit ? "Update Organization" : "Create Organization"
                                }
                            </Button>
                        </div>
                    </form>
                </Form >
            </DialogContent>
        </Dialog>
    );
};
