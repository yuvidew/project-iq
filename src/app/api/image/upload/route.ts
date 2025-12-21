import { NextResponse } from "next/server";
import { ID } from "node-appwrite";

import { createAdminClient } from "@/server/appwriter";
import { APPWRITER_BUCKET_ID, ENDPOINT, PROJECT_ID } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const altText = formData.get("altText");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "File is required" },
                { status: 400 },
            );
        }

        // Reuse the user's Appwrite session so file permissions stay aligned with the user
        const storage = await (async () => {
            try {
                const sessionClient = await createAdminClient();
                return sessionClient?.storage;
            } catch {
                return null;
            }
        })();

        if (!storage) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const appwriteFile = new File(
            [arrayBuffer],
            file.name,
            { type: file.type || "application/octet-stream" },
        );

        const uploaded = await storage.createFile(
            APPWRITER_BUCKET_ID,
            ID.unique(),
            appwriteFile,
        );

        const fileUrl =
            `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;

        return NextResponse.json(
            {
                fileId: uploaded.$id,
                url: fileUrl,
                altText: typeof altText === "string" ? altText : undefined,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Image upload failed", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 },
        );
    }
}
