
import { useEffect, useRef } from "react";
import slugify from "slugify";


import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, UploadIcon } from "lucide-react"
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useUploadImage } from "@/features/image/hooks/use-upload-image-hook";
import { cn, fileToBase64 } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const OrganizationFromSchema = z.object({
    name: z.string().min(2, { message: "Organization name must be at least 2 characters." }).max(100, { message: "Organization name must be at most 100 characters." }),
    description: z.string().max(500, { message: "Description must be at most 500 characters." }).optional(),
    slug: z.string().min(2, { message: "Slug must be at least 2 characters." }).max(50, { message: "Slug must be at most 50 characters." }),
    logoUrl: z.string().url().optional(),
});

type OrganizationFromValue = z.infer<typeof OrganizationFromSchema>;

export const CreateOrganizationForm = () => {
    const isMobile = useIsMobile();
    const { mutate: onUploadImage, data: uploadImageData, isPending: isUploadingImage } = useUploadImage();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<OrganizationFromValue>({
        resolver: zodResolver(OrganizationFromSchema),
        defaultValues: {
            name: "",
            description: "",
            slug: "",
            logoUrl: "",
        },
    });

    const nameValue = form.watch("name");
    const slugManuallyEdited = useRef(false);

    // Auto-generate slug from name
    useEffect(() => {
        if (!nameValue) return;

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
    }, [nameValue, form]);

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
    const onChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const base64 = await fileToBase64(file);

        onUploadImage({
            base64,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            // altText: "optional"
        });
        fileInputRef.current?.value && (fileInputRef.current.value = "");
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={isMobile ? "icon" : "default"}>
                    <PlusIcon className=" size-4" />
                    {!isMobile && "Create Organization"}
                </Button>
            </DialogTrigger>
            <DialogContent className=" gap-10">
                <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className=" flex flex-col gap-5">
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
                                <div className={cn("size-24 rounded-md bg-muted overflow-hidden flex items-center justify-center", uploadImageData?.url ? "border border-primary" : "")}>
                                    {isUploadingImage ? (
                                        <Spinner className="text-primary" />
                                    ) : uploadImageData?.url ? (
                                        <img
                                            src={uploadImageData.url}
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
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create Organization</Button>
                        </div>
                    </form>
                </Form >
            </DialogContent>
        </Dialog>
    )
}
