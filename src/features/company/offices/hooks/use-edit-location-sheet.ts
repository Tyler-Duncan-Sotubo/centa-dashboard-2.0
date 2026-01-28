"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import {
  locationSchema,
  type LocationFormData,
} from "../schema/location.schema";

type DefaultValues = LocationFormData & {
  id: string;
  latitude: number;
  longitude: number;
};

export function useEditLocationSheet(params: {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: DefaultValues;
}) {
  const { isOpen, onClose, defaultValues } = params;

  const [isSheetOpen, setSheetOpen] = useState(isOpen);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultValues.latitude,
    lng: defaultValues.longitude,
  });

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  });

  useEffect(() => {
    setSheetOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const defaultPosition = { lat: 6.5244, lng: 3.3792 };

    const isValidCoord = (value: unknown) =>
      typeof value === "number" && !isNaN(value) && value !== 0;

    const lat = defaultValues.latitude;
    const lng = defaultValues.longitude;

    setCoords(
      isValidCoord(lat) && isValidCoord(lng) ? { lat, lng } : defaultPosition,
    );

    // keep form synced when defaultValues changes
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const updateLocation = useUpdateMutation({
    endpoint: `/api/locations/${defaultValues.id}`,
    successMessage: "Office location updated successfully",
    refetchKey: "office-locations onboarding",
    onSuccess: () => {
      onClose();
      setSheetOpen(false);
    },
    onError: (err) => setError(err),
  });

  const onSubmit = async (data: LocationFormData) => {
    if (!coords) {
      setError("Please select coordinates on the map");
      return;
    }

    updateLocation(
      { ...data, latitude: coords.lat, longitude: coords.lng },
      setError,
    );
  };

  const footerLoading = form.formState.isSubmitting;

  return {
    form,
    coords,
    setCoords,

    error,
    setError,

    isSheetOpen,
    setSheetOpen,

    onSubmit,
    footerLoading,
    close: onClose,
  };
}
