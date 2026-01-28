"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { CalendarIcon, XCircle } from "lucide-react";
import React, { useState } from "react";

export const FilterSection = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  statusFilter,
  setStatusFilter,
  resetFilters,
}: {
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  resetFilters: () => void;
}) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  return (
    <section className="flex items-center justify-end mb-4 w-full gap-2">
      {/* From Date */}
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {fromDate
              ? format(new Date(fromDate), "MMM dd, yyyy")
              : "From Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0">
          <Calendar
            mode="single"
            selected={fromDate ? new Date(fromDate) : undefined}
            onSelect={(date) => {
              setFromDate(date ? date.toISOString().split("T")[0] : "");
              setFromOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* To Date */}
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {toDate ? format(new Date(toDate), "MMM dd, yyyy") : "To Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0">
          <Calendar
            mode="single"
            selected={toDate ? new Date(toDate) : undefined}
            onSelect={(date) => {
              setToDate(date ? date.toISOString().split("T")[0] : "");
              setToOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Status Select */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="requested">Requested</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={resetFilters}>
        <XCircle className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </section>
  );
};
