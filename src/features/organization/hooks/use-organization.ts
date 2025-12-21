import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


// Hooks for organization operations
export const useCreateOrganization = () => {
    const router = useRouter()
    const trpc = useTRPC();
    return useMutation(
        trpc.organization.createOrganization.mutationOptions({
            onSuccess: (data) => {
                toast.success("Organization created successfully");
                router.push(`/organizations/${data.slug}`)

            },
            onError: (data) => toast.error(data.message)
        })
    );
};

// // Hook to get list of organizations
// export const useGetOrganizations = () => {
//     const trpc = useTRPC();
//     // TODO: Add pagination and search support
//     return useQuery({
//         queryKey: ["organizations"],
//         queryFn: () => trpc.organization.getOrganizations.queryOptions(),
//     });
// };

// // Hook to get organization by ID
// export const useGetOrganizationById = (id: string) => {
//     const trpc = useTRPC();
//     return useQuery({
//         queryKey: ["organization", id],
//         queryFn: () => trpc.organization.getOrganizationById.queryOptions(id),
//     });
// };

// // Hook to update organization
// export const useUpdateOrganization = () => {
//     const trpc = useTRPC();
//     return useMutation(
//         trpc.organization.updateOrganization.mutationOptions({
//             onSuccess: () => {
//                 toast.success("Organization updated successfully");
//             },
//             onError: (data) => toast.error(data.message)
//         })
//     );
// };

// // Hook to delete organization
// export const useDeleteOrganization = () => {
//     const trpc = useTRPC();
//     return useMutation(
//         trpc.organization.deleteOrganization.mutationOptions({
//             onSuccess: () => {
//                 toast.success("Organization deleted successfully");
//             },
//             onError: (data) => toast.error(data.message)
//         })
//     );
// };

