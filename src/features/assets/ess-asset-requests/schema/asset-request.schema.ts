import { z } from "zod";
import { assetTypes, urgencyLevels } from "../config/asset-request.options";

export const assetRequestSchema = z.object({
  requestDate: z.date({ required_error: "Date is required" }),
  assetType: z.enum(assetTypes),
  urgency: z.enum(urgencyLevels),
  purpose: z.string().min(3, "Purpose is required"),
  notes: z.string().optional(),
});

export type AssetRequestSchema = z.infer<typeof assetRequestSchema>;
