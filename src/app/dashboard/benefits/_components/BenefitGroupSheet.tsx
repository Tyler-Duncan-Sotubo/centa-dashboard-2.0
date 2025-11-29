"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GenericSheet from "@/components/ui/generic-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import FormError from "@/components/ui/form-error";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { FaEdit } from "react-icons/fa";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";

const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teamId: z.string().optional(),
  description: z.string().optional(),
  rules: z
    .object({
      onlyConfirmed: z.boolean().optional(),
      minMonths: z.coerce.number().optional(),
      minAge: z.coerce.number().optional(),
      departments: z.array(z.string()).optional(),
      employmentTypes: z.array(z.string()).optional(),
    })
    .optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface BenefitGroupSheetProps {
  defaultValues?: GroupFormValues;
  groupId?: string;
}

export const BenefitGroupSheet = ({
  defaultValues,
  groupId,
}: BenefitGroupSheetProps) => {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const fetchBenefitsPlans = async () => {
    try {
      const res = await axiosAuth.get("/api/employee-groups");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: teams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["benefits"],
    queryFn: fetchBenefitsPlans,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  const createGroup = useCreateMutation({
    endpoint: "/api/benefit-groups",
    successMessage: "Benefit group created successfully",
    refetchKey: "benefit-groups",
    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      setError(null);
    },
    onError: setError,
  });

  const updateGroup = useUpdateMutation({
    endpoint: `/api/benefit-groups/${groupId}`,
    successMessage: "Benefit group updated successfully",
    refetchKey: "benefit-groups",
    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      setError(null);
    },
    onError: setError,
  });

  const onSubmit = async (values: GroupFormValues) => {
    if (groupId) {
      await updateGroup(values, setError);
    } else {
      await createGroup(values, setError);
    }
  };

  const trigger = (
    <>
      {groupId ? (
        <Button variant={"ghost"} size={"sm"} onClick={() => setIsOpen(true)}>
          <FaEdit />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)}>New Group</Button>
      )}
    </>
  );

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <GenericSheet
      trigger={trigger}
      title={groupId ? "Edit Benefit Group" : "Create Benefit Group"}
      description="Define a benefit group and its rules"
      open={isOpen}
      onOpenChange={setIsOpen}
      position="right"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter group name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="teamId" // store the selected team's id
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t: { id: string; name: string }) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-20 resize-none"
                    {...field}
                    placeholder="Optional group description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="font-semibold text-md">Eligibility Rules</h4>

            <FormField
              name="rules.onlyConfirmed"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Only confirmed employees</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="rules.minMonths"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum months employed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        placeholder="e.g. 6"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="rules.minAge"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        placeholder="e.g. 21"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="rules.departments"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Comma-separated e.g. HR, Engineering"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((v) => v.trim())
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="rules.employmentTypes"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Types</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Comma-separated e.g. full_time, contract"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((v) => v.trim())
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="bg-brand text-white w-full">
            {groupId ? "Update Group" : "Create Group"}
          </Button>
          {error && <FormError message={error} />}
        </form>
      </Form>
    </GenericSheet>
  );
};
