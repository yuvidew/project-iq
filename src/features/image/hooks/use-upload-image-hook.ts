import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadedImage {
    fileId: string;
    url: string;
    altText?: string;
    uploadedBy?: string;
}

interface UploadImagePayload {
    file: File;
    altText?: string;
}

const uploadImageRequest = async ({ file, altText }: UploadImagePayload): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("file", file);
    if (altText) formData.append("altText", altText);

    const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(json?.error || "Failed to upload image");
    }

    return json;
};

export const useUploadImage = () => {
    return useMutation<UploadedImage, Error, UploadImagePayload>({
        mutationFn: uploadImageRequest,
        onSuccess: () => {
            toast.success("Image uploaded successfully");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}
