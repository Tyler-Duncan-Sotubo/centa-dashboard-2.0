"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import GenericSheet from "@/components/ui/generic-sheet";
import FormError from "@/components/ui/form-error";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa"; // Make sure this matches your DTO
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { DateInput } from "@/components/ui/date-input";

const schema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().min(1, "Date is required"),
  year: z.string().min(1, "Year is required"),
  type: z.string().min(1, "Type is required"),
  country: z.string().optional(),
  countryCode: z.string().optional(),
});

const countries = [
  { name: "Nigeria", code: "NG" },
  { name: "Ghana", code: "GH" },
  { name: "Kenya", code: "KE" },
  { name: "United Kingdom", code: "GB" },
];

type HolidayForm = z.infer<typeof schema>;

export function HolidayModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: HolidayForm & { id?: string };
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<HolidayForm>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      date: "",
      year: "",
      type: "",
      country: "",
      countryCode: "",
    },
  });

  const create = useCreateMutation({
    endpoint: `/api/holidays/custom-holidays`,
    successMessage: `Holiday added successfully`,
    refetchKey: "holidays",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const update = useUpdateMutation({
    endpoint: `/api/holidays/update-holiday/${id}`,
    successMessage: `Holiday updated successfully`,
    refetchKey: "holidays",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async (data: HolidayForm) => {
    if (isEditing) {
      await update(data, setError, form.reset);
    } else {
      await create(data, setError, form.reset);
    }
  };

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        isEditing ? (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Edit size={20} />
          </Button>
        ) : (
          <Button onClick={() => setIsOpen(true)}>
            <FaPlus /> Add Holiday
          </Button>
        )
      }
      title={isEditing ? "Edit Holiday" : "Add Holiday"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="holiday-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="holiday-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-10"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Holiday Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Independence Day" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="date"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DateInput
                      {...field}
                      onChange={(date) => field.onChange(date.toString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="year"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2025" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Public" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="country"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const selected = countries.find((c) => c.name === value);
                      form.setValue("country", selected?.name || "");
                      form.setValue("countryCode", selected?.code || "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="countryCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </GenericSheet>
  );
}
