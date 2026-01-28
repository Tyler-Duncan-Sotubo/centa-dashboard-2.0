"use client";

import { useEffect } from "react";
import { useTour } from "./TourProvider";
import { tours } from "./tours";
import { getSeenVersion } from "./storage";
import { TourId } from "./types/tours-id.types";

export function TourLauncher({
  id,
  autoStart = true,
}: {
  id: TourId;
  autoStart?: boolean;
}) {
  const { start } = useTour();

  useEffect(() => {
    if (!autoStart) return;

    const tour = tours[id];
    const seen = getSeenVersion(id);
    const shouldRun = seen !== tour.version;

    if (shouldRun) start(id);
  }, [autoStart, id, start]);

  return null;
}
