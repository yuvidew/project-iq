"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, Car, SquarePenIcon, UploadIcon } from "lucide-react";
import { OrganizationFormSchema, OrganizationFormValue } from "@/form-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, use, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUploadImage } from "@/features/image/hooks/use-upload-image-hook";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import {
  useDeleteOrgBySlug,
  useGetAccessMembers,
  useSuspenseOrganizationBySlugSetting,
} from "../hooks/use-settings";
import { useUpdateOrganization } from "@/features/organization/hooks/use-organization";
import { AccessMemberTable } from "./access-table";

export const SettingErrorView = () => {
  return <ErrorView message="Error loading organization settings" />;
};

export const SettingLoadingView = () => {
  return <LoadingView message="Loading organization settings..." />;
};

const OrganizationSetting = () => {
  const {
    mutate: onUploadImage,
    data: uploadImageData,
    isPending: isUploadingImage,
  } = useUploadImage();
  const { mutate: onUpdateOrganization, isPending: isUpdatingOrg } =
    useUpdateOrganization();

  const { data } = useSuspenseOrganizationBySlugSetting();

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const slugManuallyEdited = useRef(false);

  const form = useForm<OrganizationFormValue>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      slug: data?.slug || "",
      logoUrl: data?.logoUrl || "",
    },
  });

  const onUpdateOrg = (value: OrganizationFormValue) => {
    onUpdateOrganization(
      {
        organizationId: data.id,
        name: value.name,
        description: value.description,
        logoUrl: value.logoUrl,
      },
      {
        onSuccess: () => {
          form.reset();
          setIsEditing(false);
        },
      },
    );
    return;
  };

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

  const logoPreview = uploadImageData?.url || form.watch("logoUrl");

  const OrgForm = () => {
    return (
      <Form {...form}>
        <form
          className=" flex flex-col gap-5"
          onSubmit={form.handleSubmit(onUpdateOrg)}
        >
          <div className="">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="organization-image"
              className=" hidden"
              onChange={onChangeImage}
            />
            <div
              className={cn(
                "size-24 rounded-md bg-muted overflow-hidden flex items-center justify-center",
                logoPreview ? "border border-primary" : "",
              )}
            >
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
            <label
              htmlFor="organization-image"
              className=" cursor-pointer text-muted-foreground text-sm"
            >
              Change organization logo
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
                      disabled={isEditing}
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
            <Button
              disabled={isUpdatingOrg}
              onClick={() => setIsEditing(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdatingOrg}>
              {isUpdatingOrg ? "Updating Organization" : "Update Organization"}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <Card className=" rounded-sm">
      <CardHeader>
        <CardTitle>Organization details</CardTitle>
        {!isEditing && (
          <CardAction>
            <Button onClick={() => setIsEditing(true)}>
              <SquarePenIcon />
              Edit Details
            </Button>
          </CardAction>
        )}
      </CardHeader>

      {isEditing ? (
        <CardContent>
          <OrgForm />
        </CardContent>
      ) : (
        <div className="flex items-start flex-row p-6 py-0">
          <div className="w-[30%] flex flex-col gap-4 ">
            <p className=" text-sm text-muted-foreground">
              Organization icon/logo
            </p>

            <div className=" size-40 rounded-md bg-muted overflow-hidden flex items-center justify-center">
              <img
                src={data.logoUrl || ""}
                alt="Organization logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="w-[70%] flex flex-col gap-10">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className=" text-muted-foreground">Name</h3>

                <p className=" text-lg">{data.name}</p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className=" text-muted-foreground">Slug</h3>

                <p className=" text-lg">{data.slug}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col gap-1">
                <h3 className=" text-muted-foreground">Description</h3>
                <p>{data.description}</p>
              </div>
            </CardFooter>
          </div>
        </div>
      )}
    </Card>
  );
};

const OrganizationAccess = () => {
  const { data: accessMembers, isLoading } = useGetAccessMembers();
  return (
    <Card className=" rounded-sm">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>
          Manage organization team members and their access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AccessMemberTable data={accessMembers} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

const OrganizationAdvanced = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { mutate: onDelete, isPending } = useDeleteOrgBySlug();

  const handleDelete = () => {
    if (!slug) return;
    onDelete({ slug });
  };

  return (
    <Card className=" rounded-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertCircleIcon size={20} />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-slate-400 text-sm mb-4">
          Irreversible actions that will have significant consequences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled={isPending} className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg transition-colors font-medium" onClick={handleDelete}>
          {isPending ? (
            <>
              <Spinner />
              Deleting organization...
            </>
          ) : " Delete Organization "}
        </Button>
      </CardContent>
    </Card>
  );
};

export const SettingView = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SettingLoadingView />;
  }

  return (
    <main className="p-6 flex flex-col gap-10 h-full lg:w-[70%] m-auto">
      {/* start to header */}
      <section className="flex flex-col gap-2">
        <h1 className=" text-3xl font-semibold">Settings</h1>
        <p className=" text-sm text-muted-foreground">
          Manage your organization settings here.
        </p>
      </section>
      {/* end to header */}

      {/* start to tabs */}
      <Tabs defaultValue="setting">
        <TabsList className=" rounded-sm">
          <TabsTrigger value="setting">Settings</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="setting">
          <OrganizationSetting />
        </TabsContent>
        <TabsContent value="access">
          <OrganizationAccess />
        </TabsContent>
        <TabsContent value="advanced">
          <OrganizationAdvanced />
        </TabsContent>
      </Tabs>
      {/* end to tabs */}
    </main>
  );
};
