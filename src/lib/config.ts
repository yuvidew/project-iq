export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
export const APPWRITER_KEY = process.env.NEXT_APPWRITE_KEY!;
export const APPWRITER_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
export const COLLECTION_ID_ORGANIZATIONS = process.env.NEXT_PUBLIC_APPWRITE_ORGANIZATION_ID!;

const normalizeEndpoint = (raw?: string) => {
    const fallback = "https://cloud.appwrite.io/v1";
    if (!raw) return fallback;
    try {
        const url = new URL(raw);
        if (url.hostname.endsWith(".cloud.appwrite.io")) {
            url.hostname = "cloud.appwrite.io";
            return url.toString();
        }
        return url.toString();
    } catch {
        return raw || fallback;
    }
};

export const ENDPOINT = normalizeEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!);