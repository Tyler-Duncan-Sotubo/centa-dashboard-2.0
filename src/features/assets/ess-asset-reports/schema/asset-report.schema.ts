import { z } from "zod";
import { reportTypes } from "../config/asset-report.options";

export const assetReportSchema = z.object({
  reportType: z.enum(reportTypes),
  description: z.string().min(5, "Description is required"),
  document: z.string().nullable().optional(), // base64 image or pdf
});

export type AssetReportSchema = z.infer<typeof assetReportSchema>;
