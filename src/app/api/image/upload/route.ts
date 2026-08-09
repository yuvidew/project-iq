import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { auth } from "@/lib/auth";
import { APPWRITER_BUCKET_ID, ENDPOINT, PROJECT_ID } from "@/lib/config";
import { createAdminClient } from "@/server/appwriter";

export const runtime = "nodejs";

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const altText = formData.get("altText");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, and WebP images are supported" },
        { status: 400 },
      );
    }

    if (file.size > maxImageSize) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller" },
        { status: 400 },
      );
    }

    const storage = await (async () => {
      try {
        const sessionClient = await createAdminClient();
        return sessionClient?.storage;
      } catch {
        return null;
      }
    })();

    if (!storage) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const appwriteFile = InputFile.fromBuffer(buffer, file.name);

    const uploaded = await storage.createFile({
      bucketId: APPWRITER_BUCKET_ID,
      fileId: ID.unique(),
      file: appwriteFile,
    });

    const fileUrl = `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;

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
