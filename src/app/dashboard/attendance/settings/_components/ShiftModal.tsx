"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import GenericSheet from "@/components/ui/generic-sheet";
import FormError from "@/components/ui/form-error";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { Shift } from "@/types/shift.type";
import { MultiSelect } from "@/components/ui/multi-select"; // your multiselect wrapper
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAxiosAuth from "@/hooks/useAxiosAuth";

type officeLocation = {
  id: string;
  name: string;
  country: string;
  street: string;
  city: string;
  state: string;
  longitude: string;
  latitude: string;
};

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const schema = z.object({
  name: z.string().min(1, "Shift name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string(),
  workingDays: z.array(z.string()),
  lateToleranceMinutes: z.coerce.number().min(0).default(10),
  allowEarlyClockIn: z.boolean().default(false),
  earlyClockInMinutes: z.coerce.number().optional(),
  allowLateClockOut: z.boolean().default(false),
  lateClockOutMinutes: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export type ShiftForm = z.infer<typeof schema>;

export function ShiftModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: Shift;
  id?: string;
}) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>(
    initialData?.workingDays || []
  );

  const form = useForm<ShiftForm>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      startTime: "",
      endTime: "",
      workingDays: [],
      locationId: "",
      lateToleranceMinutes: 10,
      allowEarlyClockIn: false,
      earlyClockInMinutes: 0,
      allowLateClockOut: false,
      lateClockOutMinutes: 0,
      notes: "",
    },
  });

  const fetchOfficeLocations = async () => {
    try {
      const res = await axiosInstance.get("/api/locations");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: locations,
    isLoading: isLoadingOffice,
    isError: isErrorOffice,
  } = useQuery<officeLocation[]>({
    queryKey: ["office-locations"],
    queryFn: fetchOfficeLocations,
    enabled: !!session?.backendTokens.accessToken,
  });

  const create = useCreateMutation({
    endpoint: "/api/shifts",
    successMessage: "Shift saved",
    refetchKey: "shifts",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const update = useUpdateMutation({
    endpoint: `/api/shifts/${id}`,
    successMessage: "Shift updated",
    refetchKey: "shifts",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async (data: ShiftForm) => {
    if (isEditing) {
      await update(
        {
          ...data,
          workingDays: selectedItems,
        },
        setError,
        form.reset
      );
    } else {
      await create(
        {
          ...data,
          workingDays: selectedItems,
        },
        setError,
        form.reset
      );
    }
  };

  if (status === "loading" || isLoadingOffice) return <Loading />;
  if (isErrorOffice)
    return <div className="text-red-500">Failed to load leave settings</div>;

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
            <FaPlus /> Add Shift
          </Button>
        )
      }
      title={isEditing ? "Edit Shift" : "Add Shift"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="shift-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="shift-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-10"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Shift Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Morning Shift" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="locationId"
            control={form.control}
            defaultValue={form.getValues("locationId") || ""} // Ensure default value
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>Office Location</FormLabel>
                <FormDescription>
                  Select the office location for this shift(optional)
                </FormDescription>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((role, index) => (
                      <SelectItem key={index} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="startTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="endTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="workingDays"
            control={form.control}
            render={() => (
              <FormItem>
                <FormLabel>Working Days</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={days.map((d) => ({ label: d, value: d }))}
                    selectedOptions={selectedItems}
                    setSelectedOptions={setSelectedItems}
                    placeholder="Select working days"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="lateToleranceMinutes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Late Tolerance (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="allowEarlyClockIn"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allow Early Clock-In</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(!!val)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="earlyClockInMinutes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Early Clock-In Minutes</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="allowLateClockOut"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allow Late Clock-Out</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(!!val)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="lateClockOutMinutes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Clock-Out Minutes</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="notes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional notes..." />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GenericSheet>
  );
}
