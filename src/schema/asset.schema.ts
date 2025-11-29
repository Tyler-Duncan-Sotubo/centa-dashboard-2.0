// schema/asset.schema.ts
import { z } from "zod";

export const assetSchema = z.object({
  // Specification
  name: z.string().min(1, "Asset name is required"),
  modelName: z.string().optional(),
  color: z.string().optional(),
  specs: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().optional(),
  serialNumber: z.string().min(1, "Serial number is required"),

  // Value
  purchasePrice: z.coerce
    .string()
    .min(0, "Purchase price must be a positive number"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  depreciationMethod: z.enum(["StraightLine", "DecliningBalance"]).optional(),
  warrantyExpiry: z.string().nullable().optional(),

  // Assignment
  employeeId: z.string().optional(),
  locationId: z.string().min(1, "Location is required"),
  lendDate: z.string().nullable().optional(),
  returnDate: z.string().nullable().optional(),
});

export type AssetForm = z.infer<typeof assetSchema>;
