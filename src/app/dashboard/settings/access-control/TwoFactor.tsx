"use client";

import { useState } from "react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/shared/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export default function TwoFactorAuthToggle() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);

  async function fetchTwoFactorSetting() {
    try {
      const res = await axiosInstance.get(
        "/api/company-settings/two-factor-auth",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return null;
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["two-factor-auth"],
    queryFn: async () => {
      const data = await fetchTwoFactorSetting();
      setEnabled(data.twoFactorAuth);
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading 2FA setting</p>;

  async function toggleTwoFactor() {
    try {
      const newValue = !enabled;
      setEnabled(newValue);

      await axiosInstance.patch(
        "/api/company-settings/two-factor-auth",
        { key: "two_factor_auth", value: newValue },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast({
        title: "Two-Factor Authentication Updated",
        description: `Two-factor authentication has been ${
          newValue ? "enabled" : "disabled"
        }.`,
        variant: "success",
      });
    } catch {
      setEnabled(!enabled);
      toast({
        title: "Failed to update two-factor authentication",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between shadow-2xs p-4 border border-monzo-textSecondary rounded-lg">
        <Label className="text-lg font-semibold">
          Two-Factor Authentication
        </Label>
        <Switch
          id="two_factor_auth"
          checked={enabled}
          onCheckedChange={toggleTwoFactor}
        />
      </div>
      <section className="flex items-center space-x-4 mt-4">
        <div>
          <p className="text-md font-medium">
            Require two-step authentication for your team
          </p>
          <p className="text-md text-muted-foreground">
            Two-factor authentication adds an extra layer of security to your
            account by requiring a second form of verification by sending code
            to the registered email on the account.
          </p>
        </div>
      </section>
    </div>
  );
}
