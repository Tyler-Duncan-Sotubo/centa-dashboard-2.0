// components/ChangePayFrequencyForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, BadgeCheck, CalendarRange, CalendarDays } from "lucide-react";
import { PayScheduleTable } from "./PayScheduleTable";
import GenericSheet from "@/components/ui/generic-sheet";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { payFrequencySchema } from "@/schema/pay-frequency.schema";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import type { PaySchedule } from "@/types/pay-schedule";
import { DateInput } from "@/components/ui/date-input";
import { FaCirclePlus } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

const payFrequencies = [
  {
    value: "biweekly",
    label: "Biweekly",
    icon: <CalendarRange className="w-12 h-12" />,
    description:
      "Every two weeks on a specific day of the week (e.g. every other Friday).",
  },
  {
    value: "monthly",
    label: "Monthly",
    icon: <CalendarDays className="w-12 h-12" />,
    description: "Once a month on a specific day of the month.",
  },
];
const holidayAdjustments = [
  { value: "previous", label: "Previous Business Day" },
];

export default function ChangePayFrequencyForm({
  schedules,
}: {
  schedules: PaySchedule[];
}) {
  const [selectedSchedule, setSelectedSchedule] = useState<PaySchedule | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof payFrequencySchema>>({
    resolver: zodResolver(payFrequencySchema),
    defaultValues: {
      payFrequency: "biweekly",
      startDate: "",
      holidayAdjustment: "previous",
      weekendAdjustment: "friday",
    },
  });

  // When editing, populate form
  useEffect(() => {
    if (selectedSchedule) {
      form.reset({
        payFrequency: selectedSchedule.payFrequency,
        startDate: selectedSchedule.startDate,
        holidayAdjustment: "previous",
        weekendAdjustment: "friday",
      });
    }
  }, [selectedSchedule, form]);

  // Mutations
  const updatePayFrequency = useUpdateMutation({
    endpoint: `/api/pay-schedules/${selectedSchedule?.id}`,
    successMessage: "Pay frequency updated successfully",
    refetchKey: "pay-schedules onboarding",
  });

  const createPayFrequency = useCreateMutation({
    endpoint: "/api/pay-schedules",
    successMessage: "Pay frequency created successfully",
    refetchKey: "pay-schedules onboarding",
  });

  async function onSubmit(data: z.infer<typeof payFrequencySchema>) {
    setError(null);
    if (!selectedSchedule) {
      await createPayFrequency(
        {
          ...data,
          countryCode: "NG",
        },
        setError,
        form.reset
      );
      setSheetOpen(false);
      setSelectedSchedule(null);
      return;
    } else {
      await updatePayFrequency(
        {
          ...data,
          countryCode: "NG",
        },
        setError,
        form.reset
      );
      setSelectedSchedule(null);
      setSheetOpen(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <section className="w-full flex items-center justify-end">
          <GenericSheet
            trigger={
              <Button
                className="flex items-center mt-5"
                onClick={() => setSheetOpen(true)}
              >
                {selectedSchedule ? (
                  <FaEdit className="w-4 h-4 mr-2" />
                ) : (
                  <FaCirclePlus className="w-4 h-4 mr-2" />
                )}
                {selectedSchedule ? "Edit Schedule" : "Add Schedule"}
              </Button>
            }
            open={isSheetOpen}
            onOpenChange={setSheetOpen}
            title={
              selectedSchedule ? "Edit Pay Schedule" : "Create Pay Schedule"
            }
            description={
              selectedSchedule
                ? "Update your existing pay schedule settings."
                : "Configure when you want to pay employees."
            }
            footer={
              <div className="flex items-center space-x-2">
                {error && <p className="text-red-600">{error}</p>}
                <Button
                  form="pay-schedule-form"
                  type="submit"
                  isLoading={form.formState.isSubmitting}
                >
                  {selectedSchedule ? "Save" : "Create"}
                </Button>
              </div>
            }
          >
            <Form {...form}>
              <form
                id="pay-schedule-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                {/* Pay Frequency */}
                <FormField
                  name="payFrequency"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Frequency</FormLabel>
                      <div className="flex gap-4">
                        {payFrequencies.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              "flex flex-col w-1/2 cursor-pointer rounded-lg p-4 border-2",
                              field.value === opt.value
                                ? "border-brand"
                                : "border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {field.value === opt.value ? (
                                <BadgeCheck color="blue" />
                              ) : (
                                <Badge />
                              )}
                              <span className="font-medium">{opt.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {opt.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Holiday Adjustment */}
                <FormField
                  name="holidayAdjustment"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holiday Adjustment</FormLabel>
                      <div className="flex gap-4">
                        {holidayAdjustments.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              "flex items-center cursor-pointer rounded-lg px-4 py-2 border-2",
                              field.value === opt.value
                                ? "border-brand"
                                : "border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            {field.value === opt.value ? (
                              <BadgeCheck />
                            ) : (
                              <Badge />
                            )}
                            <span className="ml-2">{opt.label}</span>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </GenericSheet>
        </section>
      </div>
      <div>
        <PayScheduleTable
          data={schedules}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
        />
        {/* Header with Add button */}
      </div>
    </div>
  );
}
