"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";

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
import { useCreateLocationSheet } from "../hooks/use-create-location-sheet";
import { NIGERIAN_STATES } from "../config/state.data";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

export function CreateLocationSheet() {
  const {
    form,
    isSheetOpen,
    setSheetOpen,
    coords,
    setCoords,
    error,
    onSubmit,
    onCancel,
  } = useCreateLocationSheet();

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
          <Button variant="outline" type="button" onClick={onCancel}>
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

          <div className="text-sm text-gray-600 mt-1">
            Lat: <strong>{coords.lat.toFixed(5)}</strong>, Lng:{" "}
            <strong>{coords.lng.toFixed(5)}</strong>
          </div>
        </div>
      </div>
    </GenericSheet>
  );
}
