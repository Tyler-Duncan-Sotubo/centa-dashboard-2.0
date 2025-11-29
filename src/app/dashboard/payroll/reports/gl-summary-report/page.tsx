"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useDownloadFile } from "@/utils/useDownloadFile";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiExport } from "react-icons/bi";
import PageHeader from "@/components/pageHeader";
import useAxiosAuth from "@/hooks/useAxiosAuth";

type GLSummaryData = {
  rows: {
    glAccountCode: string;
    yearMonth: string;
    label: string;
    debit: string;
    credit: string;
  }[];
  columns: {
    field: string;
    title: string;
  }[];
};

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export default function GLSummaryTable() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: downloadLoading } = useDownloadFile(token);
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;

  const fetchGLSummary = async (token: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/payroll-report/gl-summary-from-payroll?month=${yearMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery<GLSummaryData>({
    queryKey: ["gl-report", yearMonth],
    queryFn: () => fetchGLSummary(session?.backendTokens.accessToken as string),
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  function ExportButton({
    endpoint,
    label = "Export",
  }: {
    endpoint: string;
    label?: string;
  }) {
    const handleExport = async () => {
      try {
        await download(`/api/payroll-report/${endpoint}?month=${yearMonth}`);
      } finally {
      }
    };

    return (
      <Button
        variant="secondary"
        onClick={handleExport}
        isLoading={downloadLoading}
        disabled={downloadLoading}
      >
        <BiExport />
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  const YearSelector = () => {
    return (
      <div className="flex gap-2 justify-end">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {format(new Date(`${year}-${m}-01`), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <section className="my-6 px-5">
      <PageHeader
        title="GL Summary Report"
        description="View and export GL summary reports for your company."
      />
      <div className="flex gap-2 justify-end">
        {YearSelector()}
        <ExportButton endpoint="gen-gl-summary-from-payroll" />
      </div>
      <div className="overflow-x-auto mt-10">
        <Table className="text-md">
          <TableHeader className="bg-monzo-primary">
            <TableRow>
              {data?.columns.map((col) => (
                <TableHead key={col.field}>{col.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.rows.length ? (
              data.rows.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={
                    row.label === "Total"
                      ? "font-semibold bg-muted py-5"
                      : "py-5"
                  }
                >
                  <TableCell className="py-3">{row.glAccountCode}</TableCell>
                  <TableCell>{row.yearMonth}</TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.debit}</TableCell>
                  <TableCell>{row.credit}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No data available for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
