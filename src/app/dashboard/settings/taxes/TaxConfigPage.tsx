"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, X, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { companyTaxDetailsSchema } from "@/schema/company-tax.schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import InfoTooltip from "@/components/InfoTooltip";

const taxFields = [
  {
    key: "tin",
    label: "T.I.N Number",
    description: "Tax Identification Number (TIN) for PAYE tax remittance.",
    fullname: "Tax Identification Number (TIN)",
    frequency: "On or before the 10th of every month.",
    explanation:
      "Required for PAYE tax remittance. Without a TIN, your business cannot legally submit employee income taxes, leading to compliance issues and penalties.",
  },
  {
    key: "nhf_code",
    label: "N.H.F Code",
    description: "National Housing Fund (NHF) mandatory contribution.",
    fullname: "National Housing Fund Code",
    frequency: "Within one month of deduction.",
    explanation:
      "Mandatory for employee home financing. Without this, NHF remittance documents cannot be generated, preventing compliance with housing contribution laws.",
  },
  {
    key: "pension_code",
    label: "Pension Code",
    description: "Pension contributions for employee retirement savings.",
    fullname: "Pension Code",
    frequency: "Within seven working days after salary payment.",
    explanation:
      "Necessary for pension remittance. Missing this code prevents pension fund payments, leading to legal risks and loss of employee retirement benefits.",
  },
];

const TaxConfig = ({ taxDetail }: { taxDetail: Record<string, string> }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enabledConfigs, setEnabledConfigs] = useState<Record<string, boolean>>(
    {
      tin: !!taxDetail?.tin,
      nhf_code: !!taxDetail?.nhf_code,
      pension_code: !!taxDetail?.pension_code,
    }
  );

  const form = useForm({
    resolver: zodResolver(companyTaxDetailsSchema),
    defaultValues: {
      tin: taxDetail?.tin || "",
      nhf_code: taxDetail?.nhf_code || "",
      pension_code: taxDetail?.pension_code || "",
    },
  });

  const toggleConfig = (key: string) => {
    if (key === "tin" && taxDetail?.tin) return; // Prevent toggling off TIN if it exists
    setEnabledConfigs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveTaxConfig = useCreateMutation({
    endpoint: "/api/company-tax-details",
    successMessage: "Tax configuration updated successfully",
    refetchKey: "company-tax-details",
  });

  const updateTaxConfig = useUpdateMutation({
    endpoint: "/api/company-tax-details",
    successMessage: "Tax configuration updated successfully",
    refetchKey: "company-tax-details",
  });

  const isObjectEmpty = (obj: object) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  };

  const emptyTaxDetail = isObjectEmpty(taxDetail);

  const handleSave = async (field: string) => {
    setIsLoading(true);
    const isValid = await form.trigger(
      field as "tin" | "nhf_code" | "pension_code"
    );
    if (!isValid) return;
    const updatedTaxData = { ...form.getValues() };

    if (emptyTaxDetail) {
      await saveTaxConfig(updatedTaxData);
      setIsLoading(false);
    } else {
      await updateTaxConfig(updatedTaxData);
      setIsLoading(false);
      setEditing(null);
    }
  };

  return (
    <Card className="md:max-w-3xl ">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="text-blue-500" /> Tax Configurations
          <InfoTooltip content="Configure tax information for your company." />
        </CardTitle>
        <CardDescription>
          Configure tax information for your company.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Form {...form}>
          {taxFields.map(
            ({ key, label, description, fullname, frequency, explanation }) => (
              <div key={key} className="border-b last:border-b-0 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel className="text-lg font-medium text-gray-700">
                      {label} Configuration
                    </FormLabel>
                    <p className="text-gray-500 text-sm">{description}</p>
                    <p className="text-gray-400 text-xs italic mt-1">
                      {explanation}
                    </p>
                  </div>
                  <Switch
                    checked={enabledConfigs[key]}
                    onCheckedChange={() => toggleConfig(key)}
                    disabled={key === "tin" && !!taxDetail?.tin}
                  />
                </div>

                {enabledConfigs[key] && (
                  <div className="mt-4">
                    {editing === key ? (
                      <>
                        <FormControl>
                          <Input
                            {...form.register(
                              key as "tin" | "nhf_code" | "pension_code"
                            )}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${label}`}
                          />
                        </FormControl>
                        <FormMessage className="mt-2 text-sm text-red-500" />

                        <div className="mt-4 flex gap-3">
                          <Button
                            type="button"
                            isLoading={isLoading}
                            onClick={() => handleSave(key)}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(null)}
                          >
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center mt-4 border-t pt-4 ">
                        <div>
                          {form.watch(
                            key as "tin" | "nhf_code" | "pension_code"
                          ) ? (
                            <div className="flex flex-col space-y-2">
                              <p className="text-gray-700 font-medium">
                                {fullname}
                              </p>
                              <p className="font-semibold text-blue-600">
                                {form.watch(
                                  key as "tin" | "nhf_code" | "pension_code"
                                )}
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                Remittance Frequency:{" "}
                                <span className="font-semibold">
                                  {frequency}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              Not configured yet.
                            </p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => setEditing(key)}
                        >
                          <Pencil />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </Form>
      </CardContent>
    </Card>
  );
};

export default TaxConfig;
