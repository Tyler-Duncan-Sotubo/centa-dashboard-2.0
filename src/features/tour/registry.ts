import { tours } from "./tours";
import { TourId } from "./types/tours-id.types";

export function hasTour(id: TourId): boolean {
  const t = tours[id];
  return !!t && Array.isArray(t.steps) && t.steps.length > 0;
}
