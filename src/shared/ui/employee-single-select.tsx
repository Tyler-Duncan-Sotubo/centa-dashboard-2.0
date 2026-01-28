/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Badge } from "@/shared/ui/badge";
import { IoIosCloseCircle } from "react-icons/io";
import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Employee } from "@/types/employees.type";

type Option = { label: string; value: string };

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface EmployeeSelectProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

export const EmployeeSingleSelect: React.FC<EmployeeSelectProps> = ({
  name,
  label,
  description,
  placeholder = "Search employees...",
  className,
}) => {
  const { control } = useFormContext();
  const watchedValue: string | undefined = useWatch({ control, name });
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // click-outside to close
  React.useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  // cache of id -> label to prevent flicker to raw id
  const labelCacheRef = React.useRef(new Map<string, string>());

  // Search list
  const { data: options = [], isLoading: isListLoading } = useQuery({
    queryKey: ["employees-summary", debouncedSearch],
    enabled: open && !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const res = await axios.get("/api/employees/all/summary", {
        params: { search: debouncedSearch },
      });
      const list: Option[] = (res.data?.data ?? []).map((emp: Employee) => ({
        label: `${emp.firstName} ${emp.lastName}${
          emp.employeeNumber ? ` (${emp.employeeNumber})` : ""
        }`,
        value: emp.id,
      }));
      // hydrate label cache
      for (const o of list) labelCacheRef.current.set(o.value, o.label);
      return list;
    },
    staleTime: 0,
  });

  // If a value is selected but not in options/cache (fresh page load), try fetch-by-id to get its label
  const { data: selectedById } = useQuery({
    queryKey: ["employee-by-id", watchedValue],
    enabled:
      !!watchedValue &&
      !labelCacheRef.current.has(watchedValue) &&
      !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      // adjust this endpoint to your actual "get one" API
      const res = await axios.get(`/api/employees/${watchedValue}`);
      const emp: Employee = res.data?.data;
      const opt: Option = {
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName}${
          emp.employeeNumber ? ` (${emp.employeeNumber})` : ""
        }`,
      };
      labelCacheRef.current.set(opt.value, opt.label);
      return opt;
    },
    staleTime: 5 * 60 * 1000,
  });

  const selectedOption: Option | null = React.useMemo(() => {
    if (!watchedValue) return null;
    const fromList = options.find((o) => o.value === watchedValue);
    if (fromList) return fromList;
    const cached = labelCacheRef.current.get(watchedValue);
    if (cached) return { value: watchedValue, label: cached };
    if (selectedById) return selectedById;
    // last resort: show id until label resolves (rare)
    return { value: watchedValue, label: watchedValue };
  }, [watchedValue, options, selectedById]);

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className} ref={containerRef as any}>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <Command className="overflow-visible bg-transparent">
              {/* Field shell */}
              <div
                className="group border border-input px-3 py-2 text-sm rounded-md
                           focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                // OPEN on shell click and focus input
                onPointerDown={() => {
                  // ignore clicks on the clear button/badge close (they already preventDefault)
                  setOpen(true);
                  // focus after paint so the input is ready
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              >
                <div className="flex gap-1 flex-wrap items-center">
                  {selectedOption ? (
                    <Badge variant="completed">
                      <span
                        className="truncate max-w-[240px]"
                        title={selectedOption.label}
                      >
                        {selectedOption.label}
                      </span>
                      <button
                        className="ml-1 rounded-full outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onMouseDown={(e) => e.preventDefault()} // don't blur
                        onClick={() => {
                          field.onChange(undefined);
                          setSearch("");
                          // re-open + focus for a new search
                          setOpen(true);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        aria-label="Clear selection"
                      >
                        <IoIosCloseCircle className="h-5 w-5 text-monzo-secondary hover:text-monzo-error" />
                      </button>
                    </Badge>
                  ) : (
                    <CommandInput
                      ref={inputRef}
                      value={search}
                      onValueChange={setSearch}
                      // remove onBlur close – click-outside handles it
                      placeholder={placeholder}
                      className="ml-2 bg-transparent outline-hidden placeholder:text-muted-foreground flex-1 w-full"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setOpen(false);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Dropdown */}
              <div className="relative mt-2 z-10">
                {open && (
                  <div className="absolute w-full z-99999 top-0 rounded-md border bg-popover text-popover-foreground shadow-md animate-in">
                    <CommandList>
                      {isListLoading ? (
                        <div className="px-4 py-2 text-muted-foreground">
                          Loading…
                        </div>
                      ) : options.length > 0 ? (
                        <CommandGroup className="max-h-64 overflow-auto">
                          {options.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              onMouseDown={(e) => e.preventDefault()} // avoid blur before select
                              onSelect={() => {
                                labelCacheRef.current.set(opt.value, opt.label);
                                field.onChange(opt.value);
                                setSearch("");
                                setOpen(false); // close explicitly on select
                              }}
                              className="cursor-pointer"
                            >
                              {opt.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>No results found.</CommandEmpty>
                      )}
                    </CommandList>
                  </div>
                )}
              </div>
            </Command>
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
