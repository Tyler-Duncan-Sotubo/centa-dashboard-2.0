/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import dynamic from "next/dynamic";
import GenericSheet from "@/components/ui/generic-sheet";
import { Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NIGERIAN_STATES } from "@/data/state.data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

const createLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  street: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormData = z.infer<typeof createLocationSchema>;

const defaultPosition = {
  lat: 6.5244,
  lng: 3.3792,
};

const OfficeLocationModal = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    defaultPosition
  );
  const [error, setError] = useState("");

  // React Hook Form
  const form = useForm<FormData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const createOfficeLocation = useCreateMutation({
    endpoint: "/api/locations",
    successMessage: "Office location created successfully",
    refetchKey: "office-locations onboarding",
    onSuccess: () => {
      setSheetOpen(false);
      setCoords(defaultPosition);
    },
    onError: (error) => {
      setError(error);
    },
  });

  async function onSubmit(data: FormData) {
    if (!coords) {
      setError("Please select coordinates on the map");
      return;
    }
    createOfficeLocation(
      {
        ...data,
        longitude: coords.lng,
        latitude: coords.lat,
      },
      setError,
      form.reset
    );
  }

  return (
    <GenericSheet
      trigger={
        <Button onClick={() => setSheetOpen(true)}>
          <Plus /> Add Office Location
        </Button>
      }
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      title="Add Location"
      footer={
        <div className="flex items-center space-x-2">
          {error && <FormError message={error} />}
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setSheetOpen(false);
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button
            form="location-form"
            type="submit"
            isLoading={form.formState.isSubmitting}
          >
            Save Office Location
          </Button>
        </div>
      }
    >
      <div>
        <Form {...form}>
          <form
            id="location-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="country"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="state"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Of Residence</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_STATES.map((state, index) => (
                          <SelectItem key={index} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="postalCode"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="100001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="street"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="No 2 Lekki Phase 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="mt-2">
          <Label>Select Coordinates</Label>
          <div className="h-[300px] relative z-0 rounded-md overflow-hidden">
            <div className="h-[300px] relative z-0 rounded-md overflow-hidden">
              <DynamicMap coords={coords} setCoords={setCoords} />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Lat: <strong>{coords.lat.toFixed(5)}</strong>, Lng:{" "}
            <strong>{coords.lng.toFixed(5)}</strong>
          </div>
        </div>
      </div>
    </GenericSheet>
  );
};

export default OfficeLocationModal;
