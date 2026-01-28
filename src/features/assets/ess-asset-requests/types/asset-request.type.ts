import type { AssetRequestSchema } from "../schema/asset-request.schema";

export type CreateAssetRequestPayload = AssetRequestSchema & {
  employeeId?: string;
};
