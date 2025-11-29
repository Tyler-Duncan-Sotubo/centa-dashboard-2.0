"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Modal from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, FileText, Banknote, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import FormError from "@/components/ui/form-error";
import { HeartPulse, Dumbbell, Gift, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { FaTooth } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const benefitDetails: Record<
  string,
  { icon: JSX.Element; description: string }
> = {
  Health: {
    icon: <HeartPulse className="w-6 h-6 text-red-500" />,
    description:
      "Medical coverage for doctor visits, prescriptions, and treatments.",
  },
  Dental: {
    icon: <FaTooth className="w-6 h-6 text-blue-500" />,
    description: "Coverage for dental exams, cleanings, and procedures.",
  },
  Wellness: {
    icon: <Dumbbell className="w-6 h-6 text-green-500" />,
    description: "Support for gym memberships, therapy, and healthy living.",
  },
  Perks: {
    icon: <Gift className="w-6 h-6 text-yellow-500" />,
    description:
      "Non-essential benefits like subscriptions, lunches, and gear.",
  },
  // Add others as needed
  Other: {
    icon: <Gift className="w-6 h-6 text-muted-foreground" />,
    description: "General employee benefits and incentives.",
  },
};

const steps = [
  { label: "Plan Details", icon: <FileText className="h-5 w-5" /> },
  { label: "Coverage", icon: <CheckSquare className="h-5 w-5" /> },
  { label: "Cost", icon: <Banknote className="h-5 w-5" /> },
];

const coverageOptions = [
  "Employee Only",
  "Employee + Spouse",
  "Employee + Children",
  "Employee + Family",
];

export const benefitSchema = z.object({
  name: z.string().min(1, "Benefit name is required"),
  description: z.string().optional(),
  coverageOptions: z.array(z.string()).min(1, "Benefit name is required"),
  cost: z.record(z.string(), z.string()).optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  split: z.enum(["employee", "employer", "shared"]),
  employerContribution: z.coerce
    .number()
    .min(0, "Employer contribution must be at least 0"),
  benefitGroupId: z.string().uuid({
    message: "Benefit group ID must be a valid UUID",
  }),
});

interface BenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefitName?: string;
  initialData?: z.infer<typeof benefitSchema> & { id?: string };
}

const BenefitModal = ({
  isOpen,
  onClose,
  benefitName,
  initialData,
}: BenefitModalProps) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const fetchBenefitsGroups = async () => {
    const res = await axiosInstance("/api/benefit-groups");
    return res.data.data;
  };

  const { data: benefitGroups, isLoading } = useQuery({
    queryKey: ["benefit-groups"],
    queryFn: fetchBenefitsGroups,
    enabled: !!session?.backendTokens?.accessToken,
  });

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
    if (initialData) {
      form.reset({
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate)
          : new Date(),
        endDate: initialData.endDate
          ? new Date(initialData.endDate)
          : undefined,
      });
    }
  }, [form, initialData]);

  const isLastStep = step === steps.length - 1;

  const handleNext = async () => {
    // Define fields required per step
    const requiredFieldsPerStep: Record<
      number,
      (keyof z.infer<typeof benefitSchema>)[]
    > = {
      0: ["name", "startDate"], // add "description" if required
      1: ["coverageOptions"],
      2: ["cost"],
    };

    const fieldsToValidate = requiredFieldsPerStep[step];

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const createBenefit = useCreateMutation({
    endpoint: "/api/benefit-plan",
    successMessage: "Benefit created successfully",
    refetchKey: "benefits",
    onSuccess: () => {
      setStep(0);
    },
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
    if (initialData) {
      await updateBenefit(
        {
          ...values,
          category: benefitName || "Other",
        },
        setError,
        form.reset
      );
    } else {
      await createBenefit(
        {
          ...values,
          category: benefitName || "Other",
        },
        setError,
        form.reset,
        onClose
      );
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep(0), 300); // Match your modal close transition duration
  };

  const currentDetails =
    benefitDetails[benefitName ?? ""] ?? benefitDetails["Other"];

  if (status === "loading" || isLoading) return <Loading />;
  if (!benefitGroups || benefitGroups.length === 0)
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
      {/* Stepper UI */}
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
      <div className="flex justify-center mb-10">
        {/* Steps in the center */}
        <div className="flex-1 flex items-center max-w-lg justify-center space-x-6 mx-4">
          {steps.map((stepObj, idx) => (
            <React.Fragment key={stepObj.label}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "p-3 rounded-full border-4",
                    idx < step
                      ? "border-brand bg-brand"
                      : idx === step
                      ? "border-brand bg-white"
                      : "border-gray-300 bg-white"
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
                    idx <= step ? "text-brand" : "text-muted-foreground"
                  )}
                >
                  {stepObj.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 self-center h-1.5 mb-5 mx-1", // slightly thicker
                    idx < step ? "bg-brand" : "bg-gray-300"
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
                        {benefitGroups.map(
                          (group: { id: string; name: string }) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
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
                                !field.value && "text-muted-foreground"
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
                              setStartOpen(false); // 👈 Close popover on select
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
                                !field.value && "text-muted-foreground"
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
                              setEndOpen(false); // 👈 Close popover on select
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
                                          (v: string) => v !== option
                                        )
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

      {/* Error message */}
      {error && <FormError message={error} />}
    </Modal>
  );
};

export default BenefitModal;
