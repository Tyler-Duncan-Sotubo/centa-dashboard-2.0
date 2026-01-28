import { ColumnDef } from "@tanstack/react-table";
import { Asset } from "@/features/assets/core/types/asset.type";
import { calculateDepreciatedValue } from "@/shared/utils/calculateDepreciatedValue";
import { AssetDetailSheet } from "./asset-details";
import { Button } from "@/shared/ui/button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { AssetModal } from "./asset-modal";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import AssetStatusSelect from "./asset-status-select";
import { AssignAssetModal } from "./asset-assign-modal";

export const AssetColumns: ColumnDef<Asset>[] = [
  {
    accessorKey: "internalId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.internalId}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Asset Name",
    cell: ({ row }) => (
      <div>
        <AssetDetailSheet asset={row.original} />
        {row.original.modelName && (
          <div className="text-sm text-muted-foreground">
            {row.original.modelName}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) =>
      row.original.employeeId ? (
        <div>
          <div className="font-medium">{row.original.assignedTo}</div>
          {row.original.assignedEmail && (
            <div className="text-sm text-muted-foreground">
              {row.original.assignedEmail}
            </div>
          )}
        </div>
      ) : (
        <AssignAssetModal assetId={row.original.id} />
      ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category <ChevronUpDown />
      </Button>
    ),
  },
  {
    accessorKey: "purchasePrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Buy Price <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.original.purchasePrice;
      return (
        <span className="font-medium">{formatCurrency(Number(price))}</span>
      );
    },
  },
  {
    id: "depreciation",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Depreciation <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const { purchasePrice, purchaseDate, usefulLifeYears } = row.original;
      const currentValue = calculateDepreciatedValue({
        purchasePrice: Number(purchasePrice),
        purchaseDate,
        usefulLifeYears,
      });

      const percentageDrop =
        ((Number(purchasePrice) - currentValue) / Number(purchasePrice)) * 100;

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(currentValue)}
          </span>
          <span className="text-xs text-monzo-error font-bold">
            -{percentageDrop.toFixed(0)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const asset = row.original;
      return <AssetStatusSelect assetId={asset.id} status={asset.status} />;
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Location <ChevronUpDown />
      </Button>
    ),
  },
  {
    accessorKey: "",
    header: "Actions",
    cell: ({ row }) => (
      <div>
        <AssetModal isEditing initialData={row.original} id={row.original.id} />
        <DeleteIconDialog itemId={row.original.id} type="assets" />
      </div>
    ),
  },
];
