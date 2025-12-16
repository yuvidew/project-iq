import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadedImage {
  fileId: string;
  url: string;
  uploadedBy: string;
}


export const useUploadImage = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.image.uploadImage.mutationOptions<UploadedImage>({
            onSuccess: () => {
                toast.success("Image uploaded successfully");
            },
            onError: (data) => toast.error(data.message)
        })
    );
}