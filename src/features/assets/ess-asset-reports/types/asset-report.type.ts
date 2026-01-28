import type { AssetReportSchema } from "../schema/asset-report.schema";

export type CreateAssetReportPayload = AssetReportSchema & {
  employeeId: string;
  assetId: string;
  documentUrl: string;
};
