"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/shared/ui/modal";
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
import FormError from "@/shared/ui/form-error";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { locationAssignSchema } from "../schema/location-assign.schema";

interface LocationAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OfficeLocation = {
  id: string;
  name: string;
  locationType: "OFFICE" | "REMOTE";
  isActive: boolean;
};

export default function LocationAssignModal({
  isOpen,
  onClose,
}: LocationAssignModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const form = useForm<z.infer<typeof locationAssignSchema>>({
    resolver: zodResolver(locationAssignSchema),
    defaultValues: {
      employeeId: "",
      locationId: "",
    },
  });

  // ✅ Fetch REMOTE locations only, and only when modal is open
  const { data: locations = [], isLoading } = useQuery<OfficeLocation[]>({
    queryKey: ["remote-locations"],
    enabled: isOpen && !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const res = await axios.get("/api/locations");
      return (res.data?.data ?? []).filter(
        (l: OfficeLocation) => l.isActive && l.locationType === "REMOTE",
      );
    },
  });

  const assignLocation = useUpdateMutation({
    endpoint: "/api/locations/assign/employee",
    successMessage: "Remote location assigned successfully",
    refetchKey: "employees locations attendance",
  });

  const onSubmit = async (values: z.infer<typeof locationAssignSchema>) => {
    await assignLocation(values, setError, () => {
      form.reset();
      onClose();
    });
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setError(null);
    }
  }, [isOpen, form]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Remote Location"
      confirmText="Assign"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <EmployeeSingleSelect
            name="employeeId"
            label="Employee"
            placeholder="Search employee"
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Remote Location</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoading
                            ? "Loading remote locations..."
                            : "Select remote location"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && <FormError message={error} />}
    </Modal>
  );
}
