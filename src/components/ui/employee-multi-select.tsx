"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as React from "react";
import { IoIosCloseCircle } from "react-icons/io";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Employee } from "@/types/employees.type";

// Option type for MultiSelect
export type Option = { label: string; value: string };

// Debounce hook (helper)
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

type MultiSelectProps = {
  options: Option[]; // options from API
  selected: Option[]; // array of selected Option objects
  onChange: (selected: Option[]) => void;
  onSearch: (query: string) => void;
  loading: boolean;
  placeholder?: string;
};

function MultiSelect({
  options,
  selected,
  onChange,
  onSearch,
  loading,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // On input, trigger search
  React.useEffect(() => {
    onSearch(inputValue);
  }, [inputValue, onSearch]);

  // Only show not-yet-selected in the dropdown
  const selectables = React.useMemo(
    () =>
      options.filter((opt) => !selected.some((sel) => sel.value === opt.value)),
    [options, selected]
  );

  const handleUnselect = (value: string) =>
    onChange(selected.filter((v) => v.value !== value));

  return (
    <Command className="overflow-visible bg-transparent">
      <div
        className="group border border-input px-3 py-2 text-sm rounded-md
                   focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((opt) => (
            <Badge key={opt.value} variant="completed">
              {opt.label}
              <button
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleUnselect(opt.value)}
              >
                <IoIosCloseCircle className="h-5 w-5 text-monzo-secondary hover:text-monzo-error" />
              </button>
            </Badge>
          ))}
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 w-full"
          />
        </div>
      </div>

      {/* Dropdown */}
      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md animate-in">
            <CommandList>
              {loading ? (
                <div className="px-4 py-2 text-muted-foreground">
                  Loading...
                </div>
              ) : selectables.length > 0 ? (
                <CommandGroup className="max-h-64 overflow-auto">
                  {selectables.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => {
                        onChange([...selected, opt]);
                        setInputValue("");
                      }}
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
  );
}

interface FormMultiSelectProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  showName?: boolean;
}

export function EmployeeMultiSelect({
  name,
  label,
  description,
  placeholder,
  className,
  showName = false,
}: FormMultiSelectProps) {
  const { control } = useFormContext();
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  // ---- Label building (for display/caching) ----
  const buildLabel = React.useCallback((emp: Employee) => {
    const empNo =
      emp.employeeNumber != null
        ? String(emp.employeeNumber).trim()
        : undefined;
    const full = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
    return empNo ? `${full} (${empNo})` : full || emp.email || shortId(emp.id);
  }, []);

  // ---- Fetch employees by query ----
  const { data: employeeRows = [], isLoading } = useQuery({
    queryKey: ["employees-search", debouncedSearch],
    queryFn: async () => {
      const res = await axios.get("/api/employees/all/summary", {
        params: { search: debouncedSearch },
      });
      return (res.data?.data ?? []) as Employee[];
    },
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 0,
  });

  // Map API rows -> options (memoized)
  const apiOptions: Option[] = React.useMemo(
    () =>
      employeeRows.map((emp) => ({
        value: emp.id,
        label: buildLabel(emp),
      })),
    [employeeRows, buildLabel]
  );

  // ---- Cache labels to avoid raw-id flashes for preselected values ----
  const labelCacheRef = React.useRef<Map<string, string>>(new Map());
  // Update cache when new options arrive
  React.useEffect(() => {
    if (apiOptions.length) {
      const cache = labelCacheRef.current;
      for (const o of apiOptions) cache.set(o.value, o.label);
    }
  }, [apiOptions]);

  // Fast lookup map (memoized)
  const optionMap = React.useMemo(
    () => new Map(apiOptions.map((o) => [o.value, o] as const)),
    [apiOptions]
  );

  // Utility: shorten an id for label fallback
  function shortId(id: string) {
    return id?.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;
  }

  // Convert an array of ids to Option[] using current options or cached labels
  const idsToOptions = React.useCallback(
    (ids: string[] = []): Option[] =>
      ids.map((id) => {
        const hit = optionMap.get(id);
        if (hit) return hit;
        const cached = labelCacheRef.current.get(id);
        return { value: id, label: cached ?? "Loading…" };
      }),
    [optionMap]
  );

  // Normalize any incoming field value to Option[] for display:
  // - if it's Option[], use as-is but refresh labels from cache/map
  // - if it's string[], convert via idsToOptions
  const normalizeToOptions = React.useCallback(
    (val: unknown): Option[] => {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        const arr = val as Option[];
        return arr.map((o) => {
          // prefer fresh label from map/cache
          const fresh =
            optionMap.get(o.value)?.label ?? labelCacheRef.current.get(o.value);
          const label = fresh ?? o.label ?? "Loading…";
          // ensure cache is warmed
          labelCacheRef.current.set(o.value, label);
          return { value: o.value, label };
        });
      }
      // treat as string[]
      return idsToOptions((val as string[]) ?? []);
    },
    [idsToOptions, optionMap]
  );

  // Memoize selectedOptions based on field value
  const fieldValueRef = React.useRef<unknown>();
  const [selectedOptions, setSelectedOptions] = React.useState<Option[]>([]);

  React.useEffect(() => {
    // Only update if field value changes
    if (
      fieldValueRef.current !== undefined &&
      fieldValueRef.current === (control._formValues?.[name] ?? undefined)
    ) {
      return;
    }
    const val = control._formValues?.[name];
    setSelectedOptions(normalizeToOptions(val));
    fieldValueRef.current = val;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [control._formValues?.[name], normalizeToOptions]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <MultiSelect
                options={apiOptions}
                selected={selectedOptions}
                onChange={(opts) => {
                  // warm cache for anything the user selects
                  const cache = labelCacheRef.current;
                  for (const o of opts) cache.set(o.value, o.label);

                  // write back based on showName shape
                  if (showName) {
                    field.onChange(opts); // Option[] (with labels)
                  } else {
                    field.onChange(opts.map((o) => o.value)); // string[]
                  }
                  setSelectedOptions(opts);
                }}
                onSearch={setSearch}
                loading={isLoading}
                placeholder={placeholder}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
