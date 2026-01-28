"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { setSeenVersion } from "./storage";
import { TourId } from "./types/tours-id.types";
import { tours } from "./tours";

type TourContextValue = {
  start: (id: TourId) => void;
  stop: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const driverRef = useRef<Driver | null>(null);

  const stop = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const start = useCallback((id: TourId) => {
    const tour = tours[id];
    if (!tour || tour.steps.length === 0) return;

    // destroy any existing tour
    driverRef.current?.destroy();

    const d = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      steps: tour.steps,
      onDestroyed: () => {
        // mark seen when user exits or completes
        setSeenVersion(tour.id, tour.version);
      },
    });

    driverRef.current = d;

    // small delay helps ensure DOM is ready after navigation
    window.setTimeout(() => d.drive(), 150);
  }, []);

  const value = useMemo(() => ({ start, stop }), [start, stop]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}
