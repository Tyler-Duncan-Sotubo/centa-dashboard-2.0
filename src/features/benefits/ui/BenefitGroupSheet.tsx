"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import GenericSheet from "@/shared/ui/generic-sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import FormError from "@/shared/ui/form-error";
import { Textarea } from "@/shared/ui/textarea";
import Loading from "@/shared/ui/loading";
import { FaEdit } from "react-icons/fa";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

import {
  benefitGroupSchema,
  type BenefitGroupFormValues,
} from "../schema/benefit-group.schema";
import { useEmployeeGroups } from "../hooks/use-employee-groups";

interface BenefitGroupSheetProps {
  defaultValues?: BenefitGroupFormValues;
  groupId?: string;
}

export function BenefitGroupSheet({
  defaultValues,
  groupId,
}: BenefitGroupSheetProps) {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { teams, isLoadingTeams, isErrorTeams } = useEmployeeGroups(isOpen);

  const form = useForm<BenefitGroupFormValues>({
    resolver: zodResolver(benefitGroupSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues);
  }, [defaultValues, form]);

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

  const onSubmit = async (values: BenefitGroupFormValues) => {
    if (groupId) return updateGroup(values, setError);
    return createGroup(values, setError);
  };

  const trigger = (
    <div>
      {groupId ? (
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          <FaEdit />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)}>New Group</Button>
      )}
    </div>
  );

  return (
    <GenericSheet
      trigger={trigger}
      title={groupId ? "Edit Benefit Group" : "Create Benefit Group"}
      description="Define a benefit group and its rules"
      open={isOpen}
      onOpenChange={setIsOpen}
      position="right"
    >
      {isLoadingTeams ? (
        <Loading />
      ) : isErrorTeams ? (
        <p>Error loading data</p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
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
              name="teamId"
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
                              e.target.value.split(",").map((v) => v.trim()),
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
                              e.target.value.split(",").map((v) => v.trim()),
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
      )}
    </GenericSheet>
  );
}
