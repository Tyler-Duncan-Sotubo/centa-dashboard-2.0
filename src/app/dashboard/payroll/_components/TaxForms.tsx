"use client";

import { DownloadIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

const templates = [
  {
    name: "PAYE",
    description: "Pay As You Earn tax deduction for employees",
    downloadLink:
      "https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757586201/tax_template_ezvvxf.xlsx",
  },
  {
    name: "NHF",
    description: "National Housing Fund contribution deduction",
    downloadLink:
      "https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757586204/nhf_template_lynhxh.xlsx",
  },
  {
    name: "Pension",
    description: "Pension contribution deduction for employees",
    downloadLink:
      "https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757586202/pension_template_moukac.xlsx",
  },
];

const TaxForms = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = (link: string) => {
    setLoading(true);
    // Simulate a download action
    setTimeout(() => {
      window.location.href = link; // This will trigger the download
      setLoading(false);
    }, 500);
  };

  return (
    <div>
      <Table className="mt-10">
        <TableHeader className="text-md">
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold"></TableHead>
            <TableHead className="font-semibold">Template Name</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template, index) => (
            <TableRow key={index}>
              <TableCell className="text-md font-semibold">
                <Image
                  src={`https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757586197/csv_gs0ray.png`}
                  alt={template.name}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell className="text-md font-semibold">
                {template.name}
              </TableCell>
              <TableCell className="text-md">{template.description}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleDownload(template.downloadLink)}
                  className="flex items-center space-x-2 "
                  variant="outline"
                  size="icon"
                  disabled={loading}
                >
                  <DownloadIcon className="w-5 h-5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaxForms;
