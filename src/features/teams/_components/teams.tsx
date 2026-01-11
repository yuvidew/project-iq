"use client";

import { Button } from "@/components/ui/button";
import {
    ActivityIcon,
    MailIcon,
    UserPlusIcon,
    UsersIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/search_box";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import z from "zod";
import { TeamMembersTable } from "./teams-table";
import { useInviteMembersForm } from "../hooks/use-invite-members-from";

import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";
import { useInviteMember, useGetOrgMembers, useSuspenseOrgDetails } from "../hooks/use-team";
import { OrganizationRole } from "@/generated/prisma";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { useTeamsParams } from "../hooks/use-teams-params";
import { useTeamsSearch } from "../hooks/use-project-search";
import { Pagination } from "@/components/ui/pagination";

export const TeamsErrorView = () => {
    return <ErrorView message='Error loading teams' />
};

export const TeamsLoadingView = () => {
    return <LoadingView message='Loading teams...' />
};

const InviteMemberSchema = z.object({
    email: z.string(),
    role: z.enum(OrganizationRole),
});

type InviteMemberValue = z.infer<typeof InviteMemberSchema>;

const InviteMember = () => {
    const { open, setOpen } = useInviteMembersForm();

    const { mutate: onInviteMember, isPending } = useInviteMember()
    const { slug } = useParams<{ slug?: string }>();

    const form = useForm<InviteMemberValue>({
        resolver: zodResolver(InviteMemberSchema),
        defaultValues: {
            email: "",
            role: OrganizationRole.ADMIN,
        },
    });

    const onSendInvitation = (value: InviteMemberValue) => {
        onInviteMember(
            { ...value, slug: slug || "" },
            {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                }
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className=" flex flex-col gap-8">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5">
                        <UserPlusIcon className="size-4" />
                        Invite Member
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Invite in workspace:{/** TODO: add organization name */}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSendInvitation)}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <div className=" relative ">
                                            <MailIcon className=' size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                                            <Input className="pl-9" placeholder="Email address.." {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={OrganizationRole.OWNER}>Owner</SelectItem>
                                            <SelectItem value={OrganizationRole.ADMIN}>Admin</SelectItem>
                                            <SelectItem value={OrganizationRole.MEMBER}>Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <div className="flex justify-end gap-2">
                            <DialogClose asChild disabled={isPending}>
                                <Button disabled={isPending} type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner />
                                        Sending...
                                    </>
                                ) : "Send Invitation"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


const ProjectsPagination = () => {
    const { data, isFetching } = useGetOrgMembers();
    const [params, setParams] = useTeamsParams();

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

const SearchComp = () => {
    const [params, setParams] = useTeamsParams(); 

    const { searchValue, onSearchChange } = useTeamsSearch({ params, setParams });

    return (
        <SearchBox
            placeholder="Search members..."
            value={searchValue}
            onChange={onSearchChange}
        />
    )
};

const TeamsProgressSection = () => {
    const {data} = useSuspenseOrgDetails();


    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
            <Card className=" rounded-sm">
                <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-gray-400 text-sm font-medium">
                            Total Members
                        </h3>
                        <p className="text-4xl font-bold ">{data.stats.totalMembers}</p>
                    </div>
                    <div className={`bg-blue-500/10 p-2 rounded-lg`}>
                        <UsersIcon className={`w-5 h-5 text-blue-500`} />
                    </div>
                </CardContent>
            </Card>

            <Card className=" rounded-sm">
                <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col gap-3" >
                        <h3 className="text-gray-400 text-sm font-medium">
                            Active Projects
                        </h3>
                        <p className="text-4xl font-bold ">{data.stats.activeProjects}</p>
                    </div>
                    <div className={`bg-green-500/10 p-2 rounded-lg`}>
                        <ActivityIcon className={`w-5 h-5 text-green-500`} />
                    </div>
                </CardContent>
            </Card>

            <Card className=" rounded-sm">
                <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col gap-3" >
                        <h3 className="text-gray-400 text-sm font-medium">My Tasks</h3>
                        <p className="text-4xl font-bold ">{data.stats.myTasks}</p>
                    </div>
                    <div className={`bg-purple-500/10 p-2 rounded-lg`}>
                        <UsersIcon className={`w-5 h-5 text-purple-500`} />
                    </div>
                </CardContent>
            </Card>
        </section>
    )
};


export const TeamsView = () => {
    const { setOpen } = useInviteMembersForm();
    
    const { data } = useGetOrgMembers();


    return (
        <>
            <main className="p-6 flex flex-col gap-10 h-full ">
                {/* start to header */}
                <section className=" flex items-start justify-between">
                    <h1 className=" text-3xl font-semibold">Teams</h1>

                    <Button onClick={() => setOpen(true)}>
                        <UserPlusIcon />
                        Invite member
                    </Button>
                </section>
                {/* end to header */}

                {/* start progress count */}
                <TeamsProgressSection />
                {/* end to progress cord */}

                {/* start to search and data table */}
                <TeamMembersTable
                    members={data.memberships.map((membership) => ({
                        id: membership.user.id,
                        name: membership.user.name || "",
                        email: membership.user.email,
                        role: membership.role,
                    }))}
                    searchFilter={<SearchComp />}
                    pagination={<ProjectsPagination/>}
                />
                {/* end to search and data table */}
            </main>

            {/* start to invite member dialog */}
            <InviteMember />
            {/* end to invite member dialog */}
        </>
    );
};
