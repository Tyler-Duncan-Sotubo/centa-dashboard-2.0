"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { Switch } from "@/shared/ui/switch";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export default function SalaryAdvanceSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  async function fetchLoanSettings() {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-settings/loan-settings",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {};
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["salary-advance-setting"],
    queryFn: async () => {
      const data = await fetchLoanSettings();
      setEnabled(data.useLoan ?? false);
      setMinAmount(String(data.minAmount || 0));
      setMaxAmount(String(data.maxAmount || 0));
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  async function toggleLoanSetting() {
    try {
      const newValue = !enabled;
      setEnabled(newValue);

      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "use_loan", value: newValue },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast({
        title: "Salary Advance Setting Updated",
        description: `Salary advance has been ${
          newValue ? "enabled" : "disabled"
        }.`,
        variant: "success",
      });
    } catch {
      setEnabled(!enabled);
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
    }
  }

  async function updateAmountSetting(
    key: "loan_min_amount" | "loan_max_amount",
    value: string,
  ) {
    const num = parseInt(value);
    if (isNaN(num)) return;

    try {
      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        {
          key,
          value: num, // convert to lowest currency unit
        },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast({
        title: "Updated Successfully",
        description:
          key === "loan_min_amount"
            ? "Minimum loan amount updated"
            : "Maximum loan amount updated",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update amount",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center gap-2">
          Salary Advance Settings
          <Switch
            id="enable_salary_advance"
            checked={enabled}
            onCheckedChange={toggleLoanSetting}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-md text-muted-foreground">
          Control if employees can request salary advances, and define the min
          and max limits.
        </p>

        {enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Minimum Advance Amount (₦)
              </label>
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                onBlur={() => updateAmountSetting("loan_min_amount", minAmount)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Maximum Advance Amount (₦)
              </label>
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                onBlur={() => updateAmountSetting("loan_max_amount", maxAmount)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
