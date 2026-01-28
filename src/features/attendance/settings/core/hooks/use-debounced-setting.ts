"use client";

import { useRef } from "react";

export function useDebouncedSetting(delayMs = 2000) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runDebounced = (fn: () => void) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fn, delayMs);
  };

  return { runDebounced };
}
