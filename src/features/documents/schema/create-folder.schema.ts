import { z } from "zod";

export const folderSchema = z.object({
  name: z.string().max(255),
  parentId: z.string().nullable().optional(), // ✅
  permissionControlled: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
  officeIds: z.array(z.string()).optional(),
});

export type FolderFormData = z.infer<typeof folderSchema>;
