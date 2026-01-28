/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/lib/utils";
import { Field } from "@/types/onboarding.type";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { nigerianBanks } from "@/features/employees/config/banks.data";
import { useEffect, useMemo, useState } from "react";
import { FileUploadField } from "@/features/ess-layout/ui/FileUploadField";

// ——— simple per-type validator ———
export function isFieldValid(field: Field, value: any): true | string {
  if (!field?.required) return true;

  const nonEmpty = (v: any) =>
    !(
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "")
    );

  switch (field.fieldType) {
    case "text":
      return nonEmpty(value)
        ? true
        : `${field.label || "This field"} is required`;
    case "select":
      return nonEmpty(value)
        ? true
        : `Please select ${field.label || "an option"}`;
    case "date": {
      if (!nonEmpty(value)) return `${field.label || "Date"} is required`;
      const d = typeof value === "string" ? new Date(value) : value;
      if (isNaN(d?.getTime?.())) return "Please pick a valid date";
      // optional bounds (same as your Calendar)
      const min = new Date("1900-01-01");
      const max = new Date();
      if (d < min || d > max) return "Date out of allowed range";
      return true;
    }
    case "file":
      // adapt if your FileUploadField returns a different shape
      return value ? true : `Please upload ${field.label || "a file"}`;
    default:
      return nonEmpty(value)
        ? true
        : `${field.label || "This field"} is required`;
  }
}

export default function DynamicField({
  field,
  value,
  onChange,
  disabled = false,
  error = null,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isRequired = !!field.required;

  // revalidate when value changes after touch
  useEffect(() => {
    if (!touched) return;
    const res = isFieldValid(field, value);
    setLocalError(res === true ? null : res);
  }, [touched, field, value]);

  const effectiveError = error ?? localError;

  const markTouchedAndMaybeValidate = () => {
    if (!touched) setTouched(true);
    const res = isFieldValid(field, value);
    setLocalError(res === true ? null : res);
  };

  const helpRow = useMemo(() => {
    // top-right status row (bank select used this before)
    return (
      <div className="flex justify-end mb-1">
        {disabled && <p className="text-blue-500 text-sm">Verifying...</p>}
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs ml-auto">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }, [disabled, effectiveError]);

  /* ─────────────── BANK SELECT ─────────────── */
  if (field.fieldKey === "bankName" && field.fieldType === "select") {
    return (
      <div onBlur={markTouchedAndMaybeValidate}>
        {helpRow}
        <Select
          value={value ?? ""}
          onValueChange={(v) => {
            onChange(v);
            // validate on change if already touched
            if (touched) {
              const res = isFieldValid(field, v);
              setLocalError(res === true ? null : res);
            }
          }}
        >
          <SelectTrigger
            className={cn(
              "w-full",
              isRequired && "required",
              effectiveError && "ring-1 ring-red-500",
            )}
            aria-required={isRequired}
            aria-invalid={!!effectiveError}
          >
            <SelectValue placeholder="Select Bank…" />
          </SelectTrigger>
          <SelectContent>
            {nigerianBanks.map((bank) => (
              <SelectItem key={bank.code} value={bank.code}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  /* ─────────────── ACCOUNT NAME (text) ─────────────── */
  if (field.fieldKey === "bankAccountName" && field.fieldType === "text") {
    return (
      <div>
        {helpRow}
        <Input
          type="text"
          value={value ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            if (touched) {
              const res = isFieldValid(field, e.target.value);
              setLocalError(res === true ? null : res);
            }
          }}
          onBlur={markTouchedAndMaybeValidate}
          placeholder="Autofilled after verification (you may also enter manually)"
          aria-required={isRequired}
          aria-invalid={!!effectiveError}
          required={isRequired}
          className={cn(effectiveError && "ring-1 ring-red-500")}
        />
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs mt-1">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }

  /* ─────────────── GENERIC TEXT ─────────────── */
  if (field.fieldType === "text") {
    return (
      <div>
        {helpRow}
        <Input
          type="text"
          value={value ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            if (touched) {
              const res = isFieldValid(field, e.target.value);
              setLocalError(res === true ? null : res);
            }
          }}
          onBlur={markTouchedAndMaybeValidate}
          aria-required={isRequired}
          aria-invalid={!!effectiveError}
          required={isRequired}
          className={cn(effectiveError && "ring-1 ring-red-500")}
        />
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs mt-1">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }

  /* ─────────────── DATE ─────────────── */
  if (field.fieldType === "date") {
    const selectedDate =
      typeof value === "string" ? new Date(value) : (value ?? null);

    return (
      <div>
        {helpRow}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onBlur={markTouchedAndMaybeValidate}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                effectiveError && "ring-1 ring-red-500",
              )}
              aria-required={isRequired}
              aria-invalid={!!effectiveError}
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  const iso = date.toISOString();
                  onChange(iso);
                  setOpen(false);
                  // validate after picking
                  const res = isFieldValid(field, iso);
                  setLocalError(res === true ? null : res);
                  if (!touched) setTouched(true);
                }
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs mt-1">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }

  /* ─────────────── GENERIC SELECT ─────────────── */
  if (field.fieldType === "select") {
    let opts: string[] = [];
    switch (field.fieldKey) {
      case "maritalStatus":
        opts = ["single", "married", "divorced", "widowed"];
        break;
      case "gender":
        opts = ["male", "female", "other"];
        break;
      default:
        opts = (field as any).options ?? ["Option A", "Option B", "Option C"];
        break;
    }

    return (
      <div onBlur={markTouchedAndMaybeValidate}>
        {helpRow}
        <Select
          value={value ?? ""}
          onValueChange={(v) => {
            onChange(v);
            if (touched) {
              const res = isFieldValid(field, v);
              setLocalError(res === true ? null : res);
            }
          }}
        >
          <SelectTrigger
            className={cn("w-full", effectiveError && "ring-1 ring-red-500")}
            aria-required={isRequired}
            aria-invalid={!!effectiveError}
          >
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {opts.map((opt) => (
              <SelectItem key={opt} value={opt} className="capitalize">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs mt-1">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }

  /* ─────────────── FILE ─────────────── */
  if (field.fieldType === "file") {
    return (
      <div onBlur={markTouchedAndMaybeValidate}>
        {helpRow}
        <FileUploadField
          value={value}
          onChange={(v) => {
            onChange(v);
            if (touched) {
              const res = isFieldValid(field, v);
              setLocalError(res === true ? null : res);
            }
          }}
          aria-required={isRequired}
          aria-invalid={!!effectiveError}
        />
        {effectiveError && (
          <p role="alert" className="text-red-500 text-xs mt-1">
            {effectiveError}
          </p>
        )}
      </div>
    );
  }

  return null;
}
