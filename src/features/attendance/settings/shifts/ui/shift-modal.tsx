"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import GenericSheet from "@/shared/ui/generic-sheet";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { MultiSelect } from "@/shared/ui/multi-select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { Shift } from "@/types/shift.type";
import { shiftDays } from "../schema/shift.schema";
import { useOfficeLocationsQuery } from "../hooks/use-office-locations-query";
import { useShiftMutation } from "../hooks/use-shift-mutation";
import { useShiftForm } from "../hooks/use-shift-form";

export function ShiftModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: Shift;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const { form, selectedWorkingDays, setSelectedWorkingDays } =
    useShiftForm(initialData);

  const { data: locations, isLoading, isError } = useOfficeLocationsQuery();

  const { createShift, updateShift } = useShiftMutation({
    id,
    onClose: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async (values: any) => {
    const payload = { ...values, workingDays: selectedWorkingDays };

    if (isEditing) {
      await updateShift(payload, setError, form.reset);
      return;
    }

    await createShift(payload, setError, form.reset);
  };

  if (isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-500">Failed to load locations</div>;

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
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>Office Location</FormLabel>
                <FormDescription>
                  Select the office location for this shift (optional)
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {(locations ?? []).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
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
                    options={shiftDays.map((d) => ({ label: d, value: d }))}
                    selectedOptions={selectedWorkingDays}
                    setSelectedOptions={setSelectedWorkingDays}
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
