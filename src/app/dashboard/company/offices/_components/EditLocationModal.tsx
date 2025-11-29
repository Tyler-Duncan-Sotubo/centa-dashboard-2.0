"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import dynamic from "next/dynamic";
import GenericSheet from "@/components/ui/generic-sheet";
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
import { FaEdit } from "react-icons/fa";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  street: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormData = z.infer<typeof locationSchema>;

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: FormData & {
    id: string;
    latitude: number;
    longitude: number;
  };
}

const EditLocationModal = ({
  isOpen,
  onClose,
  defaultValues,
}: EditLocationModalProps) => {
  const [isSheetOpen, setSheetOpen] = useState(isOpen);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultValues.latitude,
    lng: defaultValues.longitude,
  });

  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  });

  useEffect(() => {
    const defaultPosition = {
      lat: 6.5244,
      lng: 3.3792,
    };
    const lat = defaultValues.latitude;
    const lng = defaultValues.longitude;

    const isValidCoord = (value: unknown) =>
      typeof value === "number" && !isNaN(value) && value !== 0;

    if (isValidCoord(lat) && isValidCoord(lng)) {
      setCoords({ lat, lng });
    } else {
      setCoords(defaultPosition);
    }
  }, [defaultValues]);

  const updateLocation = useUpdateMutation({
    endpoint: `/api/locations/${defaultValues.id}`,
    successMessage: "Office location updated successfully",
    refetchKey: "office-locations onboarding",
    onSuccess: () => {
      onClose();
      setSheetOpen(false);
    },
    onError: (error) => {
      setError(error);
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!coords) {
      setError("Please select coordinates on the map");
      return;
    }

    updateLocation(
      {
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
      },
      setError
    );
  };

  return (
    <GenericSheet
      trigger={
        <Button onClick={() => setSheetOpen(true)} variant="ghost">
          <FaEdit />
        </Button>
      }
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      title="Edit Location"
      footer={
        <div className="flex items-center space-x-2">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="edit-location-form"
            type="submit"
            isLoading={form.formState.isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div>
        <Form {...form}>
          <form
            id="edit-location-form"
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
            <DynamicMap coords={coords} setCoords={setCoords} />
          </div>
        </div>
      </div>
    </GenericSheet>
  );
};

export default EditLocationModal;
