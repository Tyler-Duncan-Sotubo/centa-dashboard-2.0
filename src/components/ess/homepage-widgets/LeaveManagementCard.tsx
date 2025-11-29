"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff } from "lucide-react";
import Link from "next/link";

interface LeaveData {
  total: number;
  breakdown: { type: string; balance: number }[];
}
export default function LeaveManagementCard({ leaves }: { leaves: LeaveData }) {
  return (
    <Card className="w-full shadow-none">
      <CardHeader className="flex  justify-between pb-2">
        <div className="flex gap-2">
          <PlaneTakeoff className="w-5 h-5 text-brand" />
          <CardTitle className="text-base">Leave Management</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Available</p>
          <h2 className="text-3xl font-bold text-foreground">
            {leaves.total} Days
          </h2>
        </div>

        <div className="space-y-2 text-muted-foreground text-md">
          {leaves.breakdown.map((item) => (
            <div key={item.type} className="flex justify-between">
              <span>{item.type}</span>
              <span className="text-foreground font-medium ">
                {item.balance} days
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Link href="/ess/leave">
            <Button className="w-full text-monzo-brand" variant={"outline"}>
              Request Leave
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
