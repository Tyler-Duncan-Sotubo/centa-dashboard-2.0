"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import InfoTooltip from "@/components/InfoTooltip";
import { RemitReusableModal } from "./_components/RemitResuableModal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export const RemittanceSettings = ({
  size = "md:w-2/3",
}: {
  size?: string;
}) => {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    deductionKey: keyof typeof deductions;
    fields: { name: string; label: string; placeholder?: string }[];
  } | null>(null);

  const [deductions, setDeductions] = useState({
    apply_paye: false, // PAYE is always true
    apply_pension: false,
    apply_nhf: false,
    apply_nhis: false,
    apply_nsitf: false,
  });

  const fetchTaxConfig = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-settings/statutory-deductions"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { isLoading, isError } = useQuery({
    queryKey: ["tax-configs"],
    queryFn: async () => {
      const data = await fetchTaxConfig();
      setDeductions({
        apply_paye: data.applyPaye, // PAYE is always true
        apply_pension: data.applyPension,
        apply_nhf: data.applyNhf,
        apply_nhis: data.applyNhis,
        apply_nsitf: data.applyNsitf,
      });
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const fetchTaxDetails = async () => {
    try {
      const res = await axiosInstance.get("/api/company-tax");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
    }
  };

  const {
    data,
    isLoading: isLoadingTaxDetails,
    isError: isErrorTaxDetails,
  } = useQuery({
    queryKey: ["tax-details"],
    queryFn: fetchTaxDetails,
    enabled: !!session?.backendTokens?.accessToken,
  });

  const handlePreToggle = (key: keyof typeof deductions) => {
    const isTurningOn = !deductions[key];

    if (isTurningOn) {
      if (key === "apply_paye") {
        setModalConfig({
          deductionKey: key,
          fields: [
            { name: "tin", label: "Company TIN", placeholder: "1234567890" },
            {
              name: "vatNumber",
              label: "VAT Number",
              placeholder: "1234567890",
            },
          ],
        });

        setModalOpen(true);
      } else if (key === "apply_pension") {
        setModalConfig({
          deductionKey: key,
          fields: [{ name: "pensionCode", label: "Pension No" }],
        });
        setModalOpen(true);
      } else if (key === "apply_nhf") {
        setModalConfig({
          deductionKey: key,
          fields: [{ name: "nhfCode", label: "NHF No" }],
        });
        setModalOpen(true);
      } else {
        handleToggle(key); // no extra info needed
      }
    } else {
      handleToggle(key); // turning off
    }
  };

  const createTaxDetails = useCreateMutation({
    endpoint: "/api/company-tax",
    successMessage: "Tax details created successfully",
    refetchKey: "tax-details onboarding payroll",
    onSuccess: async () => {
      await axiosInstance.post("/api/company-settings/onboarding-progress", {
        module: "payroll",
        task: "tax_details",
        status: "done",
      });
    },
  });

  const updateTaxDetails = useUpdateMutation({
    endpoint: "/api/company-tax",
    successMessage: "Tax details updated successfully",
    refetchKey: "tax-details onboarding payroll",
    onSuccess: async () => {
      await axiosInstance.post("/api/company-settings/onboarding-progress", {
        module: "payroll",
        task: "tax_details",
        status: "done",
      });
    },
  });

  const handleModalSubmit = async (values: Record<string, string>) => {
    if (modalConfig) {
      if (data?.companyId) {
        // Update existing tax details
        await updateTaxDetails({ ...values });
      } else {
        // Create new tax details
        await createTaxDetails(values);
      }

      await handleToggle(modalConfig.deductionKey);
    }

    setModalOpen(false);
    setModalConfig(null);
  };

  async function handleToggle(key: keyof typeof deductions) {
    try {
      const newValue = !deductions[key];

      // Optimistically update UI
      setDeductions({ ...deductions, [key]: newValue });

      // API: send only the key and new value
      const res = await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key, value: newValue },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        }
      );

      if (res.status !== 200) throw new Error("Failed to update");

      queryClient.invalidateQueries({
        queryKey: ["tax-configs", "onboarding", "payroll"],
      });

      toast({
        variant: "success",
        title: "Deduction Updated",
        description: `${key.replace("_", " ").toUpperCase()} has been ${
          newValue ? "enabled" : "disabled"
        }.`,
      });
    } catch (error) {
      console.error("Toggle failed:", error);

      // Revert UI
      setDeductions({ ...deductions, [key]: deductions[key] });

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update ${key.replace("_", " ").toUpperCase()}.`,
      });
    }
  }

  if (status === "loading" || isLoading || isLoadingTaxDetails)
    return <Loading />;
  if (isError || isErrorTaxDetails)
    return <div className="text-red-500">Failed to load tax config</div>;

  return (
    <Card className={`${size}  my-6`}>
      {/* Deduction Settings */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="text-blue-500" /> Remittance Settings
          <InfoTooltip content="Configure the deductions to be applied to employee salaries." />
        </CardTitle>
        <CardDescription>
          Enable or disable deductions you want to include in the payroll.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Map over the taxConfig object to render deduction settings dynamically */}
        {Object.entries(deductions).map(([key]) => (
          <div
            key={key}
            className="flex justify-between items-center py-4 border-b last:border-none"
          >
            <Label htmlFor={key} className="font-semibold text-lg">
              {key.replace("_", " ").toUpperCase()}
            </Label>
            <Switch
              id={key}
              checked={deductions[key as keyof typeof deductions]}
              onCheckedChange={() =>
                handlePreToggle(key as keyof typeof deductions)
              }
            />
          </div>
        ))}
      </CardContent>

      {modalConfig && (
        <RemitReusableModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          fields={modalConfig.fields}
          title={`Additional Info for ${modalConfig.deductionKey
            .replace("_", " ")
            .toUpperCase()}`}
        />
      )}
    </Card>
  );
};
