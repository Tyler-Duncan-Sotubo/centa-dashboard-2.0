"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";

const assetTypes = [
  "Laptop",
  "Monitor",
  "Phone",
  "Furniture",
  "Other",
] as const;
const urgencyLevels = ["Normal", "High", "Critical"] as const;

const assetSchema = z.object({
  requestDate: z.date({ required_error: "Date is required" }),
  assetType: z.enum(assetTypes),
  urgency: z.enum(urgencyLevels),
  purpose: z.string().min(3, "Purpose is required"),
  notes: z.string().optional(),
});

type AssetRequestValues = z.infer<typeof assetSchema>;

export default function AssetRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dateOpen, setDateOpen] = useState(false);

  const form = useForm<AssetRequestValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      requestDate: new Date(),
      assetType: "Laptop",
      urgency: "Normal",
      purpose: "",
      notes: "",
    },
  });

  const createRequest = useCreateMutation({
    endpoint: "/api/asset-requests",
    successMessage: "Asset request submitted",
    refetchKey: "asset-requests",
    onSuccess: () => router.push("/ess/assets"),
  });

  const onSubmit = async (data: AssetRequestValues) => {
    await createRequest({ ...data, employeeId: session?.user.id }, () => null);
  };

  return (
    <div className="max-w-xl">
      <NavBackButton href="/ess/assets">Back to Assets</NavBackButton>
      <PageHeader
        title="Asset Request"
        description="Request new assets for your work needs."
        icon="📝"
      />
      <div>
        <div className="my-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Request Date */}
              <FormField
                control={form.control}
                name="requestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Date</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asset Type */}
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Urgency */}
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {urgencyLevels.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purpose */}
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Why do you need this asset?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting…" : "Submit Request"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
