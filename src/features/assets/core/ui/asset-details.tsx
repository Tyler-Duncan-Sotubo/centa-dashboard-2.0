"use client";

import { Asset } from "@/features/assets/core/types/asset.type";
import GenericSheet from "@/shared/ui/generic-sheet";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import Link from "next/link";

export function AssetDetailSheet({ asset }: { asset: Asset }) {
  const [isOpen, setIsOpen] = useState(false);
  // 1. Generate year-by-year depreciation data
  const generateDepreciationData = () => {
    const purchaseYear = new Date(asset.purchaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const years = Math.min(
      asset.usefulLifeYears,
      currentYear - purchaseYear + 1,
    );

    const annualDepreciation =
      Number(asset.purchasePrice) / Number(asset.usefulLifeYears);

    return Array.from({ length: years }, (_, i) => {
      const year = purchaseYear + i;
      const value = Math.max(
        Number(asset.purchasePrice) - annualDepreciation * i,
        0,
      );

      return {
        year: String(year),
        value: parseFloat(value.toFixed(2)),
      };
    });
  };

  const depreciationData = generateDepreciationData();

  const trigger = (
    <Link
      href="#"
      onClick={() => setIsOpen(true)}
      className="p-0 text-md text-monzo-brand"
    >
      <p>{asset.name}</p>
    </Link>
  );

  const title = (
    <div className="flex items-center justify-between gap-2 mt-6">
      <div>
        <p>{asset.name}</p>
        <p className="text-xs text-muted-foreground">{asset.modelName || ""}</p>
      </div>
      <div>
        <Button>Request Return</Button>
      </div>
    </div>
  );

  return (
    <GenericSheet
      trigger={trigger}
      open={isOpen}
      onOpenChange={setIsOpen}
      title={title}
    >
      <div className="space-y-6">
        {/* Assigned To Section */}
        <div className="bg-white p-4 rounded-lg shadow-lg border mt-6">
          <h2 className="text-lg font-semibold mb-2">Assigned To</h2>
          <div className="text-sm text-muted-foreground">
            {asset.assignedTo ? (
              <>
                <p>Name: {asset.assignedTo}</p>
                <p>Email: {asset.assignedEmail}</p>
                <p>Location: {asset.location}</p>
              </>
            ) : (
              <p>Currently unassigned</p>
            )}
          </div>
        </div>

        {/* Asset Value Section with Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <h2 className="text-lg font-semibold mb-4">Asset Value</h2>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 text-center sm:text-left">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground capitalize font-medium tracking-wide">
                Current Value
              </p>
              <p className="text-base font-semibold">
                {formatCurrency(
                  depreciationData[depreciationData.length - 1].value,
                )}{" "}
                <span className="text-red-600 text-sm font-normal">
                  (-
                  {(
                    ((Number(asset.purchasePrice) -
                      depreciationData[depreciationData.length - 1].value) /
                      Number(asset.purchasePrice)) *
                    100
                  ).toFixed(0)}
                  %)
                </span>
              </p>
            </div>

            <div className="flex-1">
              <p className="text-xs text-muted-foreground capitalize font-medium tracking-wide">
                Purchase Price
              </p>
              <p className="text-base font-semibold">
                {formatCurrency(Number(asset.purchasePrice))}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-xs text-muted-foreground capitalize font-medium tracking-wide">
                Depreciated Amount
              </p>
              <p className="text-base font-semibold">
                {formatCurrency(
                  Number(asset.purchasePrice) -
                    depreciationData[depreciationData.length - 1].value,
                )}
              </p>
            </div>
          </div>

          <div className="h-48 mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depreciationData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specification Section */}
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <h2 className="text-lg font-semibold mb-2">Specifications</h2>
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b">
                <td className="font-medium py-2">Model</td>
                <td>{asset.modelName || "-"}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Color</td>
                <td>{asset.color || "-"}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Specs</td>
                <td>{asset.specs || "-"}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Serial Number</td>
                <td>{asset.serialNumber}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Category</td>
                <td>{asset.category}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Manufacturer</td>
                <td>{asset.manufacturer || "-"}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Purchase Date</td>
                <td>{asset.purchaseDate}</td>
              </tr>
              <tr className="border-b">
                <td className="font-medium py-2">Warranty Expiry</td>
                <td>{asset.warrantyExpiry || "-"}</td>
              </tr>
              <tr>
                <td className="font-medium py-2">Status</td>
                <td>{asset.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GenericSheet>
  );
}
