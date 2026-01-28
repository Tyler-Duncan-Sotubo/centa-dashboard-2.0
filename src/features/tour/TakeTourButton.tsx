"use client";

import { useEffect, useMemo, useState } from "react";
import { useTour } from "./TourProvider";
import { tours } from "./tours";
import { getSeenVersion } from "./storage";
import { TourId } from "./types/tours-id.types";
import { HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

type Props = {
  id: TourId;
  className?: string;
  label?: string;
};

export function TakeTourButton({
  id,
  className,
  label = "Take a tour",
}: Props) {
  const { start } = useTour();
  const [visible, setVisible] = useState(false);

  const tour = useMemo(() => tours[id], [id]);
  const tourExists = !!tour && (tour.steps?.length ?? 0) > 0;

  useEffect(() => {
    if (!tourExists) {
      setVisible(false);
      return;
    }

    const seen = getSeenVersion(id);
    // show only if user hasn't seen this tour version yet
    setVisible(seen !== tour.version);
  }, [id, tourExists, tour?.version]);

  if (!visible) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => start(id)}
      className={className}
    >
      <HelpCircle className="h-4 w-4 mr-2" />
      {label ?? "Take a tour"}
    </Button>
  );
}
