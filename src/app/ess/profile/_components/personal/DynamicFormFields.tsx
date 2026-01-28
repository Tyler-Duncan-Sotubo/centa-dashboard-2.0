/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
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
                return (
                  <FormItem>
                    <FormLabel required={!!f.required}>{f.label}</FormLabel>

                    {f.controlType === "popoverCalendar" && (
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          max={new Date().toISOString().split("T")[0]} // disables future dates
                          className="w-full"
                        />
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
