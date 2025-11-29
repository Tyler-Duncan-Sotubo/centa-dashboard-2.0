import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Asset } from "@/types/asset.type";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { AlertTriangle } from "lucide-react"; // optional icon

export function AssetCard({ asset }: { asset: Asset }) {
  const assignedOn = asset.lendDate
    ? format(new Date(asset.lendDate), "dd MMM yyyy")
    : "—";

  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {asset.name}
            {asset.hasReport && (
              <span className="flex items-center text-red-600 text-xs font-medium ml-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Issue Reported
              </span>
            )}
          </CardTitle>
          <Badge>{asset.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="text-sm text-muted-foreground space-y-2 pt-4">
        <Item label="Internal ID" value={asset.internalId ?? ""} />
        <Item label="Model" value={asset.modelName ?? ""} />
        <Item label="Category" value={asset.category} />
        <Item label="Serial Number" value={asset.serialNumber} />
        <Item label="Location" value={asset.location} />
        <Item label="Assigned On" value={assignedOn} />

        <div className="flex justify-end mt-4 space-x-2">
          <Button
            variant="outline"
            className="h-9"
            disabled={asset.hasReport}
            onClick={() =>
              router.push(
                `/ess/assets/report?assetId=${asset.id}&assetName=${asset.name}`
              )
            }
          >
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-md">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
