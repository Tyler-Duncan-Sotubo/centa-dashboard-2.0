"use client";
import { Button } from "@/shared/ui/button";

export function TriggerErrorButton() {
  return (
    <Button
      onClick={() => {
        throw new Error("TEST: user-triggered error");
      }}
    >
      Trigger Error
    </Button>
  );
}
