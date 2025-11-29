/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { AllowedCols } from "../../schema/fields";

// numeric → Tailwind spans
const spanMap: Record<AllowedCols, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  6: "sm:col-span-6",
  12: "sm:col-span-12",
};

export type FieldConfig = {
  name: string;
  label: string;
  required?: boolean;
  type: "text" | "date" | "boolean" | "textarea" | "enum";
  controlType?: "popoverCalendar" | "checkbox" | "textarea" | "select";
  icon?: React.ElementType;
  options?: string[];
  cols?: AllowedCols;
};

export function DynamicFormFields({
  control,
  fields,
}: {
  control: any;
  fields: FieldConfig[];
}) {
  // track open state for each popoverCalendar field
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggleOpen = (name: string, value: boolean) =>
    setOpenMap((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="grid grid-cols-12 gap-4">
      {fields.map((f) => {
        const base = "col-span-12";
        const smSpan = f.cols ? spanMap[f.cols] : "sm:col-span-12";

        return (
          <div key={f.name} className={cn(base, smSpan)}>
            <FormField
              name={f.name}
              control={control}
              render={({ field }) => {
                const date = field.value ? new Date(field.value) : undefined;
                const Icon = f.icon;

                return (
                  <FormItem>
                    <FormLabel required={!!f.required}>{f.label}</FormLabel>

                    {f.controlType === "popoverCalendar" && (
                      <FormControl>
                        <Popover
                          open={!!openMap[f.name]}
                          onOpenChange={(val) => toggleOpen(f.name, val)}
                          modal
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              onClick={() =>
                                toggleOpen(f.name, !openMap[f.name])
                              } // ✅ manual toggle
                            >
                              {Icon && <Icon className="mr-2 inline-block" />}
                              {field.value
                                ? format(new Date(date!), "PPP")
                                : `Select ${f.label.toLowerCase()}`}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-auto p-0 z-[50]"
                            align="start"
                            side="bottom"
                            sideOffset={8}
                          >
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(d) => {
                                if (d) {
                                  field.onChange(format(d, "yyyy-MM-dd")); // ✅ no timezone shift
                                  toggleOpen(f.name, false); // ✅ close after select
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    )}

                    {f.controlType === "checkbox" && (
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={(v) => field.onChange(!!v)}
                        />
                      </FormControl>
                    )}

                    {f.type === "enum" && f.options && (
                      <FormControl>
                        <Select
                          value={field.value as string}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${f.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {f.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    )}

                    {f.type === "textarea" && (
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={f.label}
                          className=" resize-none h-24"
                        />
                      </FormControl>
                    )}

                    {!f.controlType &&
                      f.type !== "textarea" &&
                      !(f.type === "enum" && f.options) && (
                        <FormControl>
                          <Input {...field} placeholder={f.label} />
                        </FormControl>
                      )}

                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
