import { APPWRITER_BUCKET_ID, ENDPOINT, PROJECT_ID } from "@/lib/config";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc";
import { ID } from "node-appwrite";
import { z } from "zod";

const UploadImageSchema = z.object({
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    // accept either raw base64 or data-url base64
    base64: z.string().min(1),
    altText: z.string().max(200).optional(),
});

const base64ToByteArray = (value: string) => {
    if (typeof globalThis.atob !== "function") {
        throw new Error("Base64 decoding is not supported in this environment");
    }
    const binary = globalThis.atob(value);
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export const imageRouter = router({
    uploadImage: publicProcedure
        .input(UploadImageSchema)
        .mutation(async ({ input, ctx }) => {
            const { base64, fileName, mimeType, altText } = input;

            // strip "data:image/png;base64," if present
            const cleaned = base64.includes("base64,")
                ? base64.split("base64,")[1]
                : base64;

            const byteArray = base64ToByteArray(cleaned);

            if (!byteArray.length) {
                throw new Error("Empty file buffer");
            }

            const appwriteFile = new File([byteArray], fileName, { type: mimeType });

            const storage = ctx.storage;
            if (!storage) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
            }

            const uploaded = await storage.createFile({
                bucketId: APPWRITER_BUCKET_ID,
                fileId: ID.unique(),
                file: appwriteFile,
            });

            const fileUrl = `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;

            return {
                fileId: uploaded.$id,
                url: fileUrl,
                altText,
            };
        }),
});
