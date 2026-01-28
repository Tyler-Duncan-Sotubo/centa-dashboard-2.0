"use client";

import { Button } from "@/shared/ui/button";
import { Taxes } from "@/types/taxes.type";
import React, { useState } from "react";
import { CalendarDays, DollarSign, Clock, Download, FileX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import PageHeader from "@/shared/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import GenericSheet from "@/shared/ui/generic-sheet";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const TaxesPage = ({ taxes }: { taxes: Taxes[] | undefined }) => {
  const [selectedTax, setSelectedTax] = useState<Taxes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const axiosInstance = useAxiosAuth();

  const getFirstAndLastDates = (month: string) => {
    const date = new Date(month);
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      1,
    );
    const lastDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      10,
    );
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return `${firstDate.toLocaleDateString(
      "en-GB",
      options,
    )} - ${lastDate.toLocaleDateString("en-GB", options)}`;
  };

  const downloadTaxExcel = async (id: string, type: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/tax/tax-filings-download/${id}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-tax.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("An error occurred while downloading the tax.");
    } finally {
      setIsLoading(false);
      setSelectedTax(null);
      setSheetOpen(false);
    }
  };

  const downloadVoluntaryExcel = async (type: string, month: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/tax/voluntary-download?type=${type}&month=${month}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-${type}-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("An error occurred while downloading the tax.");
    } finally {
      setIsLoading(false);
      setSelectedTax(null);
      setSheetOpen(false);
    }
  };

  const updateTax = useUpdateMutation({
    endpoint: `/api/tax/${selectedTax?.id}`,
    successMessage: "Tax Status Updated successfully",
    refetchKey: "taxes",
  });

  const updateTaxStatus = async (
    id: string,
    status: "pending" | "completed",
  ) => {
    await updateTax({ status });
    setSelectedTax(null);
    setSheetOpen(false);
  };

  const pendingTaxes = taxes?.filter((tax) => tax.status !== "completed");
  const completedTaxes = taxes?.filter((tax) => tax.status === "completed");

  const TaxCard = ({ tax }: { tax: Taxes }) => {
    return (
      <div
        className={`border-l-4 border shadow-lg rounded-lg py-8 px-6 flex justify-between my-4 text-sm ${
          tax.status === "completed" ? "border-l-success" : "border-l-warning"
        }`}
      >
        <div>
          <h1 className="text-xl font-semibold mb-6">{tax.tax_type}</h1>
          <section className="md:flex space-y-5 justify-between md:space-x-16 md:space-y-0">
            <div>
              <p className="text-md text-gray-500 mb-1">AMOUNT DUE</p>
              <p className="font-medium text-md">
                {formatCurrency(Number(tax.total_deductions))}
              </p>
            </div>
            <div>
              <p className="text-md text-gray-500 mb-1">DUE DATE</p>
              <p className="font-medium text-md">
                {tax.status === "pending"
                  ? "Ready For Processing"
                  : "Completed"}
              </p>
            </div>
            <div>
              <p className="text-md text-gray-500 mb-1">DEPOSIT PERIOD</p>
              <p className="font-medium text-md">
                {getFirstAndLastDates(tax.month)}
              </p>
            </div>
          </section>
        </div>
        <Button
          className="flex items-center px-3 py-2 bg-brand text-white rounded"
          onClick={() => {
            setSelectedTax(tax);
            setSheetOpen(true);
          }}
        >
          View Details
        </Button>
      </div>
    );
  };

  return (
    <div className="relative px-6">
      <PageHeader
        title="Taxes"
        description="View and manage your tax filings."
      />

      <Tabs defaultValue="pending" className="my-6 w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingTaxes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileX size={50} className="text-gray-400" />
              <p className="text-md text-gray-500 mt-4">
                No tax records available.
              </p>
            </div>
          ) : (
            <section className="md:flex flex-col space-y-4 md:w-[70%]">
              {pendingTaxes?.map((tax, index) => (
                <TaxCard key={index} tax={tax} />
              ))}
            </section>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedTaxes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileX size={50} className="text-gray-400" />
              <p className="text-md text-gray-500 mt-4">
                No tax records available.
              </p>
            </div>
          ) : (
            <section className="md:flex flex-col space-y-4 md:w-[75%]">
              {completedTaxes?.map((tax, index) => (
                <TaxCard key={index} tax={tax} />
              ))}
            </section>
          )}
        </TabsContent>
      </Tabs>

      {selectedTax && (
        <GenericSheet
          trigger={<></>}
          title=""
          description=""
          position="right"
          open={isSheetOpen}
          onOpenChange={setSheetOpen}
          footer={<div></div>}
        >
          <div className="relative w-full">
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">
                  {selectedTax.tax_type} Tax Details
                </h2>
                {selectedTax.status === "completed" ? (
                  <div className="bg-green-700 text-white text-center py-1 px-4 rounded-md">
                    <p className="font-bold">PAID</p>
                  </div>
                ) : (
                  <Button
                    className="h-10"
                    onClick={() => updateTaxStatus(selectedTax.id, "completed")}
                  >
                    Mark As Paid
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6 border-b-2 border-gray-100 pb-6">
              <div className="py-3 flex items-center space-x-3">
                <div className="p-3 rounded-lg shadow-xl text-black bg-orange-300">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="text-md text-gray-600">Deposit Period</h3>
                  <p className="text-md font-medium">
                    {getFirstAndLastDates(selectedTax.month)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-16">
                <div className="py-3 flex items-center space-x-3">
                  <div className="p-3 rounded-lg shadow-xl text-black bg-green-300">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-md text-gray-600">Amount Due</p>
                    <p className="text-md font-medium">
                      {formatCurrency(Number(selectedTax.total_deductions))}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center space-x-3">
                  <div className="p-3 rounded-lg shadow-xl text-black bg-blue-300">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-md text-gray-600">Due Date</p>
                    <p className="text-md font-medium">
                      {selectedTax.status === "pending"
                        ? "Ready For Processing"
                        : "Processed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl my-5 font-medium">Tax Breakdown</h2>
            <Table className="text-md font-medium">
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Tax Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {getFirstAndLastDates(selectedTax.month)}
                  </TableCell>
                  <TableCell className="py-4">
                    {formatCurrency(Number(selectedTax.total_deductions))}
                  </TableCell>
                  <TableCell className="text-right capitalize text-orange-600">
                    {selectedTax.status}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6">
              <Button
                className="w-44"
                isLoading={isLoading}
                onClick={() => {
                  if (
                    selectedTax.tax_type === "Union Dues" ||
                    selectedTax.tax_type === "Cooperative Society"
                  ) {
                    downloadVoluntaryExcel(
                      selectedTax.tax_type,
                      selectedTax.month,
                    );
                  } else {
                    downloadTaxExcel(selectedTax.id, selectedTax.tax_type);
                  }
                }}
              >
                <Download />
                Download
              </Button>
            </div>
          </div>
        </GenericSheet>
      )}
    </div>
  );
};

export default TaxesPage;
