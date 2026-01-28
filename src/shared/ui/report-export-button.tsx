"use client";

import { Button } from "@/shared/ui/button";
import { BiExport } from "react-icons/bi";

type Props = {
  onExport: () => Promise<void> | void;
  isLoading: boolean;
  label?: string;
  endpointLabel?: string; // optional aria/context
};

export function ReportExportButton({
  onExport,
  isLoading,
  label = "Export",
  endpointLabel,
}: Props) {
  return (
    <Button
      variant="secondary"
      onClick={() => onExport()}
      isLoading={isLoading}
      disabled={isLoading}
      aria-label={endpointLabel ? `Export ${endpointLabel}` : "Export"}
    >
      <BiExport />
      <span className="ml-2">{label}</span>
    </Button>
  );
}
