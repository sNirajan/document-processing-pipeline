import { z } from "zod";

export const DocumentSchema = z.object({
    title: z.string(),
    date: z.string().nullable(),
    authors: z.string().array(),
    summary: z.string().min(10)
})

export type Document = z.infer<typeof DocumentSchema>;