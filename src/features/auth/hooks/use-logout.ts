

import { useTRPC } from '@/trpc/trpc-client-provider';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';


export const useLogout = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return useMutation(
        trpc.auth.logout.mutationOptions({
            onSuccess: () => {
                toast.success("Logout successfully");
                router.push("/sign-in");
            },
            onError : (data) => toast.error(data.message)
        })
    );


}
