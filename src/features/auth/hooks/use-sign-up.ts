"use client";

import { useTRPC } from '@/trpc/trpc-client-provider';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useSignUp = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return useMutation(
        trpc.auth.signUp.mutationOptions({
            onSuccess: () => {
                toast.success("Your account is Created successfully");

                router.push("/sign-in");
            },
            onError : (data) => toast.error(data.message)
        })
    );
}
