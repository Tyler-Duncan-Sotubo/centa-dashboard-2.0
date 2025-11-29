import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean().optional(),
});
