"use client";

import { useTRPC } from '@/trpc/trpc-client-provider';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useSignIn = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return useMutation(
        trpc.auth.signIn.mutationOptions({
            onSuccess: () => {
                toast.success("Sign in Successfully");
                window.location.href = "/organizations";
            },
            onError : (data) => toast.error(data.message)
        })
    );
}
