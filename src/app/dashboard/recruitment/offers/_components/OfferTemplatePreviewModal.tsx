"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { getHtmlPreview } from "./getHtmlPreview";

export function OfferTemplatePreviewModal({
  open,
  onOpenChange,
  templateHtml,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templateHtml: string;
}) {
  const compiledHtml = getHtmlPreview(templateHtml);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        <style jsx global>{`
          .offer-preview p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }
          .offer-preview h3 {
            margin: 1.5rem 0 0.75rem;
            font-size: 1.125rem;
          }
          .offer-preview hr {
            margin: 2rem 0;
            border: none;
            border-top: 1px solid #ddd;
          }
          .offer-preview table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1rem;
          }
          .offer-preview th,
          .offer-preview td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
          }
        `}</style>

        <div
          className="offer-preview"
          dangerouslySetInnerHTML={{ __html: compiledHtml }}
        />
      </DialogContent>
    </Dialog>
  );
}
