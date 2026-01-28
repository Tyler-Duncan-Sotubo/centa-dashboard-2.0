"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/shared/ui/modal";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";
import { cn } from "@/lib/utils";

import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { CalendarIcon, Check } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { format } from "date-fns";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { benefitSchema } from "../schema/benefit.schema";
import { useBenefitGroups } from "../hooks/use-benefit-groups";
import {
  benefitDetails,
  benefitSteps,
  coverageOptions,
} from "../config/benefit-modal.constants";

interface BenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefitName?: string;
  initialData?: z.infer<typeof benefitSchema> & { id?: string };
}

export function BenefitModal({
  isOpen,
  onClose,
  benefitName,
  initialData,
}: BenefitModalProps) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const { status, groups, isLoadingGroups, isErrorGroups } = useBenefitGroups();

  const form = useForm<z.infer<typeof benefitSchema>>({
    resolver: zodResolver(benefitSchema),
    defaultValues: {
      name: initialData?.name || "",
      benefitGroupId: initialData?.benefitGroupId || "",
      description: initialData?.description || "",
      coverageOptions: initialData?.coverageOptions || [],
      cost: initialData?.cost || {},
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      split: initialData?.split || "employee",
      employerContribution:
        initialData?.employerContribution !== undefined
          ? initialData.employerContribution
          : 0,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      ...initialData,
      startDate: initialData.startDate
        ? new Date(initialData.startDate)
        : new Date(),
      endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
    });
  }, [form, initialData]);

  const isLastStep = step === benefitSteps.length - 1;

  const handleNext = async () => {
    const requiredFieldsPerStep: Record<
      number,
      (keyof z.infer<typeof benefitSchema>)[]
    > = {
      0: ["name", "startDate"],
      1: ["coverageOptions"],
      2: ["cost"],
    };

    const fieldsToValidate = requiredFieldsPerStep[step];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) setStep((prev) => Math.min(prev + 1, benefitSteps.length - 1));
  };

  const createBenefit = useCreateMutation({
    endpoint: "/api/benefit-plan",
    successMessage: "Benefit created successfully",
    refetchKey: "benefits",
    onSuccess: () => setStep(0),
  });

  const updateBenefit = useUpdateMutation({
    endpoint: `/api/benefit-plan/${initialData?.id}`,
    successMessage: "Benefit updated successfully",
    refetchKey: "benefits",
    onSuccess: () => {
      setStep(0);
      onClose();
      form.reset();
    },
  });

  const onSubmit = async (values: z.infer<typeof benefitSchema>) => {
    setError(null);

    const payload = {
      ...values,
      category: benefitName || "Other",
    };

    if (initialData) {
      await updateBenefit(payload, setError, form.reset);
      return;
    }

    await createBenefit(payload, setError, form.reset, onClose);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep(0), 300);
  };

  const currentDetails =
    benefitDetails[benefitName ?? ""] ?? benefitDetails["Other"];

  if (status === "loading" || isLoadingGroups) return <Loading />;
  if (!groups || groups.length === 0)
    return <div>No benefit groups available</div>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      confirmText={isLastStep ? "Save" : "Next"}
      onConfirm={isLastStep ? form.handleSubmit(onSubmit) : handleNext}
      isLoading={form.formState.isSubmitting}
      disableConfirm={form.formState.isSubmitting}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          {currentDetails.icon}
          <span className="text-lg font-semibold">
            Add {benefitName || "Benefit"}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {currentDetails.description}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-center mb-10">
        <div className="flex-1 flex items-center max-w-lg justify-center space-x-6 mx-4">
          {benefitSteps.map((stepObj, idx) => (
            <React.Fragment key={stepObj.label}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "p-3 rounded-full border-4",
                    idx < step
                      ? "border-brand bg-brand"
                      : idx === step
                        ? "border-brand bg-white"
                        : "border-gray-300 bg-white",
                  )}
                >
                  {idx < step ? (
                    <Check size={25} className="text-white" />
                  ) : (
                    stepObj.icon
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm mt-1",
                    idx <= step ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  {stepObj.label}
                </span>
              </div>

              {idx < benefitSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 self-center h-1.5 mb-5 mx-1",
                    idx < step ? "bg-brand" : "bg-gray-300",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          {step === 0 && (
            <>
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Plan Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="benefitGroupId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefit Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Benefit Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group: { id: string; name: string }) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
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
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover
                        open={startOpen}
                        onOpenChange={setStartOpen}
                        modal
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setStartOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (optional)</FormLabel>
                      <Popover open={endOpen} onOpenChange={setEndOpen} modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setEndOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Plan Description"
                        className="resize-none h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="coverageOptions"
                control={form.control}
                render={() => (
                  <FormItem>
                    <div className="space-y-2">
                      {coverageOptions.map((option) => (
                        <FormField
                          key={option}
                          name="coverageOptions"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(option)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([
                                        ...(field.value ?? []),
                                        option,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter(
                                          (v: string) => v !== option,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-lg">
                                {option}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="split"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Split</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Who pays?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("split") === "shared" && (
                <FormField
                  name="employerContribution"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Contribution (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          placeholder="e.g. 50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg">
                What is the total cost of this benefit to the employee?
              </h2>
              <p className="text-sm text-muted-foreground">
                Please enter the cost for each coverage tier.
              </p>

              <FormField
                name="cost"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3 mt-2">
                      {form
                        .getValues("coverageOptions")
                        ?.map((tier: string) => (
                          <FormItem key={tier}>
                            <FormLabel className="text-sm">{tier}</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2 w-f">
                                <Input
                                  type="text"
                                  className="flex-1"
                                  value={field.value?.[tier] || ""}
                                  onChange={(e) =>
                                    field.onChange({
                                      ...field.value,
                                      [tier]: e.target.value,
                                    })
                                  }
                                />
                                <p className="w-2/3">per month</p>
                              </div>
                            </FormControl>
                          </FormItem>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </form>
      </Form>

      {error && <FormError message={error} />}
    </Modal>
  );
}

export default BenefitModal;
