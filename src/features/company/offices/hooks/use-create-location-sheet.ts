"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import {
  locationSchema,
  type LocationFormData,
} from "../schema/location.schema";

const defaultPosition = { lat: 6.5244, lng: 3.3792 };

export function useCreateLocationSheet() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    defaultPosition,
  );
  const [error, setError] = useState("");

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
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
      setError("");
      form.reset();
    },
    onError: (err) => setError(err),
  });

  const onSubmit = async (data: LocationFormData) => {
    if (!coords) {
      setError("Please select coordinates on the map");
      return;
    }

    createOfficeLocation(
      { ...data, longitude: coords.lng, latitude: coords.lat },
      setError,
      form.reset,
    );
  };

  const onCancel = () => {
    setSheetOpen(false);
    setError("");
    setCoords(defaultPosition);
    form.reset();
  };

  return {
    form,

    isSheetOpen,
    setSheetOpen,

    coords,
    setCoords,

    error,

    onSubmit,
    onCancel,
  };
}
