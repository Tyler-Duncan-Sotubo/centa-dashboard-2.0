"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import GenericSheet from "@/components/ui/generic-sheet";
import { FaPlus } from "react-icons/fa";
import { Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { ExpenseForm, expenseSchema } from "@/schema/expense.schema";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FileUploader } from "@/components/common/FileUploader";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

const expenseCategories = [
  "Travel",
  "Meals",
  "Supplies",
  "Transport",
  "Accommodation",
  "Entertainment",
  "Other",
];

export function ExpenseModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: Partial<ExpenseForm>;
  id?: string;
  employeeName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<{
    name: string;
    type: string;
    base64: string;
  } | null>(null);

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      employeeId: "",
      date: "",
      category: "",
      purpose: "",
      amount: "",
      paymentMethod: "",
    },
  });

  const create = useCreateMutation({
    endpoint: "/api/expenses",
    successMessage: "Expense saved",
    refetchKey: "expenses",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const update = useUpdateMutation({
    endpoint: `/api/expenses/${id}`,
    successMessage: "Expense updated",
    refetchKey: "expenses",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async (data: ExpenseForm) => {
    if (isEditing && id) {
      await update({
        ...data,
        employeeId: initialData?.employeeId || data.employeeId,
        receiptUrl: receiptFile?.base64 || "",
      });
    } else {
      await create(
        {
          ...data,
          receiptUrl: receiptFile?.base64 || "",
        },
        setError,
        form.reset
      );
    }
  };

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <span>
          {isEditing ? (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Edit size={20} />
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(true)}>
              <FaPlus className="mr-2" />
              Add New
            </Button>
          )}
        </span>
      }
      title={isEditing ? "Edit Expense" : "Add Expense"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="expense-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-10"
        >
          {!isEditing && (
            <EmployeeSingleSelect
              name="employeeId"
              label="Assign to"
              placeholder="Search employees..."
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const date = field.value ? new Date(field.value) : null;

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel required>Date</FormLabel>
                    <Popover open={open} onOpenChange={setOpen} modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="secondary"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date
                              ? format(date, "MMM dd, yyyy")
                              : "Select a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date || undefined}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              field.onChange(
                                selectedDate.toISOString().split("T")[0]
                              ); // Keep it yyyy-mm-dd
                              setOpen(false); // ✅ Close popover on select
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="purpose"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Purpose</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Business trip, client lunch..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Amount</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="paymentMethod"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Credit Card, Cash" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FileUploader
            value={receiptFile}
            onChange={setReceiptFile}
            label="Upload Receipt"
          />
        </form>
      </Form>
    </GenericSheet>
  );
}
