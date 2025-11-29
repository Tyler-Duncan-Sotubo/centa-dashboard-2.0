"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import FormError from "@/components/ui/form-error";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";

// --- schema ---
const schema = z.object({
  defaultVisibility: z.enum(["private", "manager", "company"]),
  defaultCadence: z.enum(["weekly", "biweekly", "monthly"]),
  defaultTimezone: z.string().min(1),
  defaultAnchorDow: z.number().int().min(1).max(7),
  defaultAnchorHour: z.number().int().min(0).max(23),
});

type FormValues = z.infer<typeof schema>;

type EffectivePolicyResponse = {
  visibility: "private" | "manager" | "company";
  cadence: "weekly" | "biweekly" | "monthly";
  timezone: string | null;
  anchorDow: number;
  anchorHour: number;
  defaultOwnerIsLead: boolean;
  _source?: {
    visibility: "system" | "company" | "team";
    cadence: "system" | "company" | "team";
    timezone: "system" | "company" | "team";
    anchorDow: "system" | "company" | "team";
    anchorHour: "system" | "company" | "team";
    defaultOwnerIsLead: "system" | "team";
  };
};

const DAY_OPTIONS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TIMEZONES = [
  "Europe/London",
  "UTC",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Kolkata",
  "Asia/Singapore",
  // add more or load from a const
];

function SourceBadge({ from }: { from?: string }) {
  if (!from) return null;
  const variant =
    from === "company" ? "outline" : from === "team" ? "pending" : "outline";
  return (
    <Badge variant={variant} className="ml-2">
      {from}
    </Badge>
  );
}

export default function CompanyPolicyForm() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const [error, setError] = React.useState<string | null>(null);

  const { data: effective, isLoading } = useQuery<EffectivePolicyResponse>({
    queryKey: ["performance-policy", "effective", { scope: "company" }],
    queryFn: async () => {
      const res = await axios.get("/api/performance-policies");
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: effective
      ? {
          defaultVisibility: effective.visibility,
          defaultCadence: effective.cadence,
          defaultTimezone: effective.timezone ?? "Europe/London",
          defaultAnchorDow: effective.anchorDow,
          defaultAnchorHour: effective.anchorHour,
        }
      : {
          defaultVisibility: "company",
          defaultCadence: "monthly",
          defaultTimezone: "Europe/London",
          defaultAnchorDow: 1,
          defaultAnchorHour: 9,
        },
  });

  const submitPolicy = useUpdateMutation({
    endpoint: "/api/performance-policies/company",
    successMessage: "Company policy updated successfully.",
    refetchKey: "performance-policy effective",
  });

  const onSubmit = (payload: FormValues) => {
    submitPolicy(payload, setError, form.reset);
  };

  // timezone combobox control
  const [tzOpen, setTzOpen] = React.useState(false);

  if (isLoading) return <Loading />;

  const src = effective?._source;

  return (
    <div className="px-5">
      <PageHeader
        title="Goal & Check-in Policies"
        description="Set company-wide defaults for visibility, cadence, and scheduling of performance goals."
      />
      <section className="border shadow-md rounded-md max-w-3xl mt-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-10 p-5 text-xmd"
          >
            {/* Visibility */}
            <FormField
              control={form.control}
              name="defaultVisibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center mb-2">
                    Default visibility
                    <SourceBadge from={src?.visibility} />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex gap-6"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="company" id="v-company" />
                        <label htmlFor="v-company">Company</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="manager" id="v-manager" />
                        <label htmlFor="v-manager">Manager</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="private" id="v-private" />
                        <label htmlFor="v-private">Private</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Who can see new objectives by default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              {/* Cadence */}
              <FormField
                control={form.control}
                name="defaultCadence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Check-in cadence
                      <SourceBadge from={src?.cadence} />
                    </FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(v) => v && field.onChange(v)}
                        className="flex py-1"
                      >
                        <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
                        <ToggleGroupItem value="biweekly">
                          Bi-weekly
                        </ToggleGroupItem>
                        <ToggleGroupItem value="monthly">
                          Monthly
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormDescription>
                      How often owners are nudged to check in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone (combobox) */}
              <FormField
                control={form.control}
                name="defaultTimezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Timezone
                      <SourceBadge from={src?.timezone} />
                    </FormLabel>
                    <FormControl>
                      <Popover open={tzOpen} onOpenChange={setTzOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-[320px] justify-between"
                          >
                            {field.value || "Select timezone"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[320px]">
                          <Command>
                            <CommandInput placeholder="Search timezone…" />
                            <CommandList>
                              <CommandEmpty>No timezone found.</CommandEmpty>
                              <CommandGroup>
                                {TIMEZONES.map((tz) => (
                                  <CommandItem
                                    key={tz}
                                    value={tz}
                                    onSelect={(v) => {
                                      form.setValue("defaultTimezone", v);
                                      setTzOpen(false);
                                    }}
                                  >
                                    {tz}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      Reminders will be scheduled in this local time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Anchor day of week */}
              <FormField
                control={form.control}
                name="defaultAnchorDow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Anchor weekday
                      <SourceBadge from={src?.anchorDow} />
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAY_OPTIONS.map((d) => (
                            <SelectItem key={d.value} value={String(d.value)}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      e.g., reminders go out on Mondays.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Anchor hour */}
              <FormField
                control={form.control}
                name="defaultAnchorHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Anchor hour
                      <SourceBadge from={src?.anchorHour} />
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select hour (0–23)" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {h.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Local time to send the reminder.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* defaultOwnerIsLead (read-only here) */}
            <div className="text-sm">
              <div className="font-medium flex items-center">
                Default owner is team lead
                <SourceBadge from={src?.defaultOwnerIsLead} />
              </div>
              <div className="mt-1 text-muted-foreground">
                Managed at the <span className="font-medium">team policy</span>{" "}
                level. Current effective:{" "}
                <span className="font-medium">
                  {effective?.defaultOwnerIsLead ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div>{error && <FormError message={error} />}</div>

            <div className="pt-4 flex gap-3">
              <Button type="submit" isLoading={form.formState.isSubmitting}>
                Save company policy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    defaultVisibility: "company",
                    defaultCadence: "monthly",
                    defaultTimezone: "Europe/London",
                    defaultAnchorDow: 1,
                    defaultAnchorHour: 9,
                  })
                }
              >
                Reset to system defaults
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}
