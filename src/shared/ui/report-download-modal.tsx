"use client";

import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import Modal from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { BiExport } from "react-icons/bi";
import { Label } from "./label";
import { format } from "date-fns";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const reportOptions = [
  { label: "Bank Advice", value: "bank" },
  { label: "Internal Summary", value: "internal" },
  { label: "Paye Report", value: "paye" },
  { label: "Pension Summary", value: "pension" },
  { label: "Nhf Summary", value: "nhf" },
  { label: "Variance Report", value: "variance" },
  { label: "Employee Variance Report", value: "employee_variance" },
  { label: "YTD Report", value: "ytdReport" },
];

export const ReportDownloadModal = ({
  id,
  date,
}: {
  id: string;
  date: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("bank");
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const reportRoutes: Record<string, string> = {
    bank: "payment-advice",
    internal: "payment-advice",
    paye: "payment-advice",
    pension: "payment-advice",
    nhf: "payment-advice",
    variance: "gen-company-variance",
    employee_variance: "gen-employee-variance",
    ytdReport: "gen-company-ytd",
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      const route = reportRoutes[selectedFormat] || "payment-advice";

      const url = route.includes("payment-advice")
        ? `/api/payroll-report/${route}/${id}?format=${selectedFormat}`
        : `/api/payroll-report/${route}`;

      const res = await axiosInstance.get(url);

      const fileUrl = res.data?.data?.url?.url;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
        setIsOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${reportRoutes[selectedFormat]} report not available`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: `${reportRoutes[selectedFormat]} report not available`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <BiExport size={16} />
        Export Reports
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Download Payroll Reports for ${format(
          new Date(date),
          "MMMM dd, yyyy",
        )}`}
        confirmText="Download"
        onConfirm={handleDownload}
        isLoading={loading}
      >
        <RadioGroup
          defaultValue={selectedFormat}
          onValueChange={setSelectedFormat}
          className="space-y-2 mt-4"
        >
          {reportOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Modal>
    </>
  );
};
