// components/performance/QuickActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import CreateCycleModal from "./CreateCycleModal";
import { MdLeaderboard, MdRateReview } from "react-icons/md";
import { TbTarget } from "react-icons/tb";
import GoalModal from "../goals/_components/GoalFormModal";

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)} className="w-full">
        <MdLeaderboard /> Create Performance Cycle
      </Button>

      <Button className="w-full border font-bold" variant={"ghost"}>
        <MdRateReview /> Create New Review
      </Button>

      <Button className="w-full font-bold" onClick={() => setGoalOpen(true)}>
        <TbTarget /> Create New Goal
      </Button>

      {/* Other quick actions can go here */}

      <CreateCycleModal open={open} setOpen={setOpen} />
      <GoalModal open={goalOpen} setOpen={setGoalOpen} />
    </div>
  );
}
