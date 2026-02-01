import z from "zod";

export const OrganizationFormSchema = z.object({
    name: z.string().min(2, { message: "Organization name must be at least 2 characters." }).max(100, { message: "Organization name must be at most 100 characters." }),
    description: z.string().max(500, { message: "Description must be at most 500 characters." }).optional(),
    slug: z.string().min(2, { message: "Slug must be at least 2 characters." }).max(50, { message: "Slug must be at most 50 characters." }),
    logoUrl: z.string().url().optional(),
});

export type OrganizationFormValue = z.infer<typeof OrganizationFormSchema>;