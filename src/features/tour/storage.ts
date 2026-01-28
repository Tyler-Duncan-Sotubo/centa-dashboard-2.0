import { TourId } from "./types/tours-id.types";

const key = (id: TourId) => `tour:${id}:version`;

export function getSeenVersion(id: TourId): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(key(id));
  return v ? Number(v) : null;
}

export function setSeenVersion(id: TourId, version: number) {
  window.localStorage.setItem(key(id), String(version));
}

export function clearSeen(id: TourId) {
  window.localStorage.removeItem(key(id));
}
