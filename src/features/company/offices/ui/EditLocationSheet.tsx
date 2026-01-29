"use client";

import dynamic from "next/dynamic";
import { FaEdit } from "react-icons/fa";

import GenericSheet from "@/shared/ui/generic-sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import FormError from "@/shared/ui/form-error";

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

import { NIGERIAN_STATES } from "@/features/company/offices/config/state.data";
import type { LocationFormData } from "../schema/location.schema";
import { useEditLocationSheet } from "../hooks/use-edit-location-sheet";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

type DefaultValues = LocationFormData & {
  id: string;
  latitude: number;
  longitude: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: DefaultValues;
}

export function EditLocationSheet({ isOpen, onClose, defaultValues }: Props) {
  const {
    form,
    coords,
    setCoords,
    error,
    isSheetOpen,
    setSheetOpen,
    onSubmit,
    footerLoading,
    close,
  } = useEditLocationSheet({ isOpen, onClose, defaultValues });

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
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            form="edit-location-form"
            type="submit"
            isLoading={footerLoading}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <FormField
                name="locationType"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Location Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OFFICE">Office</SelectItem>
                        <SelectItem value="HOME">Home</SelectItem>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                      </SelectContent>
                    </Select>
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
          <div className="h-75 relative z-0 rounded-md overflow-hidden">
            <DynamicMap coords={coords} setCoords={setCoords} />
          </div>
        </div>
      </div>
    </GenericSheet>
  );
}
