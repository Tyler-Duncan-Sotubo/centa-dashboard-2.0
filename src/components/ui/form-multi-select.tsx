"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { useMemo } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export type Option = { label: string; value: string };

interface FormMultiSelectProps {
  name: string;
  label?: string;
  description?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
}

function MultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
}: MultiSelectProps) {
  const toggle = (val: string) => {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    );
  };

  const selectedOptions = useMemo(
    () => options.filter((opt) => value.includes(opt.value)),
    [options, value]
  );

  return (
    <div className="space-y-2">
      {/* Selected chips shown outside the dropdown */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((opt) => (
            <div key={opt.value}>
              <Button
                type="button"
                variant={"link"}
                onClick={() => toggle(opt.value)}
                className="hover:text-red-500 p-1"
              >
                <X className="w-3 h-3" /> {opt.label}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown trigger and menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
          >
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="max-h-64 w-96 overflow-auto"
        >
          {options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function FormMultiSelect({
  name,
  label,
  description,
  options,
  placeholder = "Select options",
  className,
}: FormMultiSelectProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <MultiSelect
              options={options}
              value={field.value || []}
              onChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
