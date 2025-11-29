"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import GenericSheet from "@/components/ui/generic-sheet";
import { FaPlus } from "react-icons/fa";
import { Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { AssetForm, assetSchema } from "@/schema/asset.schema";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { DateInput } from "@/components/ui/date-input";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

export function AssetModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: Partial<AssetForm>;
  id?: string;
}) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData || {
      name: "",
      modelName: "",
      color: "",
      specs: "",
      category: "",
      manufacturer: "",
      serialNumber: "",
      purchasePrice: "",
      purchaseDate: "",
      locationId: "",
      employeeId: "",
    },
  });

  const fetchOfficeLocations = async (token: string) => {
    try {
      const res = await axiosInstance.get("/api/locations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: locations,
    isLoading: isLoadingOffice,
    isError: isErrorOffice,
  } = useQuery({
    queryKey: ["office-locations"],
    queryFn: () =>
      fetchOfficeLocations(session?.backendTokens.accessToken as string),
    enabled: !!session?.backendTokens.accessToken && isOpen,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const create = useCreateMutation({
    endpoint: "/api/assets",
    successMessage: "Asset saved",
    refetchKey: "assets",
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
    },
  });

  const update = useUpdateMutation({
    endpoint: `/api/assets/${id}`,
    successMessage: "Asset updated",
    refetchKey: "assets",
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
    },
  });

  const onSubmit = async (data: AssetForm) => {
    const cleanedData = {
      ...data,
      employeeId: data.employeeId?.trim() || undefined,
    };

    if (isEditing && id) {
      await update(data);
    } else {
      await create(cleanedData, setError);
    }
  };

  if (isLoadingOffice) return <Loading />;
  if (isErrorOffice) return <div>Error fetching employees</div>;

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        isEditing ? (
          <Button
            variant="link"
            onClick={() => setIsOpen(true)}
            className="px-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setIsOpen(true)}>
            <FaPlus className="mr-2" /> Add Asset
          </Button>
        )
      }
      title={isEditing ? "Edit Asset" : "Add Asset"}
      description={
        isEditing
          ? "Update the asset details below."
          : "Fill in the asset details to add a new asset."
      }
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="asset-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="asset-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-6"
        >
          {/* === Specification Section === */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <h3 className="text-md font-semibold text-muted-foreground">
              Specifications
            </h3>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Asset Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. MacBook Pro 16”" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="modelName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. M3 Pro 14”" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="color"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Space Gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="specs"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specs</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 16GB RAM, 512GB SSD"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Monitor">Monitor</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="manufacturer"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Apple" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="serialNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Serial Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. MBP-2024-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Value Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="purchasePrice"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Purchase Price</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="purchaseDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Purchase Date</FormLabel>
                  <DateInput
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Assignment Section */}
          <EmployeeSingleSelect
            name="employeeId"
            label="Assign to"
            placeholder="Search employees..."
          />

          <FormField
            name="locationId"
            control={form.control}
            defaultValue={form.getValues("locationId") || ""} // Ensure default value
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>Office Location</FormLabel>
                <FormDescription>
                  Select the office location for this Asset
                </FormDescription>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map(
                      (
                        role: {
                          id: string;
                          name: string;
                        },
                        index: number
                      ) => (
                        <SelectItem key={index} value={role.id}>
                          {role.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GenericSheet>
  );
}
