"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Expense } from "./ExpenseColumns";
import { useState } from "react";

type Props = {
  data: Expense[] | undefined;
  filters: {
    requester: string;
    category: string;
    status: string;
  };
  onChange: (filters: Props["filters"]) => void;
};

export const ExpenseFilters = ({ data, filters, onChange }: Props) => {
  const [temp, setTemp] = useState(filters);
  const [open, setOpen] = useState(false); // 👈 control popover visibility

  const uniqueValues = (key: keyof Expense) =>
    Array.from(new Set(data?.map((d) => d[key])));

  const handleApply = () => {
    onChange(temp);
    setOpen(false); // 👈 closes popover
  };

  const handleReset = () => {
    const cleared = { requester: "all", category: "all", status: "all" };
    setTemp(cleared);
    onChange(cleared);
    setOpen(false); // 👈 optional: also close on reset
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-4">
        {/* Requester */}
        <div>
          <label className="text-sm mb-1 block">Requester</label>
          <Select
            value={temp.requester}
            onValueChange={(value) =>
              setTemp((prev) => ({ ...prev, requester: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues("requester").map((r) => (
                <SelectItem key={String(r)} value={String(r)}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm mb-1 block">Category</label>
          <Select
            value={temp.category}
            onValueChange={(value) =>
              setTemp((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues("category").map((c) => (
                <SelectItem key={String(c)} value={String(c)}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm mb-1 block">Status</label>
          <Select
            value={temp.status}
            onValueChange={(value) =>
              setTemp((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
