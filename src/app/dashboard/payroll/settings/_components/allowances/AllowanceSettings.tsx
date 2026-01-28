"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import InfoTooltip from "@/shared/ui/info-tooltip";
import Loading from "@/shared/ui/loading";
import { useToast } from "@/shared/hooks/use-toast";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

interface Allowance {
  type: string;
  percentage?: number;
  fixedAmount?: number;
}

interface AllowanceSettingsData {
  basicPercent: number;
  housingPercent: number;
  transportPercent: number;
  allowanceOthers: Allowance[];
}

export default function AllowanceSettings({
  size = "md:w-2/3",
}: {
  size?: string;
}) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  // States for inline edits
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<number>(0);

  // States for adding new allowance
  const [newType, setNewType] = useState("");
  const [newPct, setNewPct] = useState<number>(0);

  // Fetch current settings
  const fetchAllowanceSettings = async () => {
    const res = await axiosInstance.get(
      "/api/payroll-settings/allowance-settings",
    );
    return res.data.data as AllowanceSettingsData;
  };

  const { data, isLoading, isError } = useQuery<AllowanceSettingsData>({
    queryKey: ["allowance-settings"],
    queryFn: fetchAllowanceSettings,
    enabled: !!session?.backendTokens?.accessToken,
  });

  const updateAllowance = useUpdateMutation({
    endpoint: "/api/payroll-settings/update-payroll-setting",
    successMessage: "Updated successfully",
    refetchKey: "allowance-settings onboarding",
    onSuccess: async () => {
      await axiosInstance.post("/api/company-settings/onboarding-progress", {
        module: "payroll",
        task: "salary_structure",
        status: "done",
      });
      setEditingKey(null);
      setNewType("");
      setNewPct(0);
    },
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError || !data) return <p className="text-red-600">Failed to load.</p>;

  // Compute total percentage
  const totalPercentage =
    data.basicPercent +
    data.housingPercent +
    data.transportPercent +
    data.allowanceOthers.reduce((sum, a) => sum + (a.percentage ?? 0), 0);
  const isValidTotal = totalPercentage === 100;

  // Handler for adding a new allowance
  const handleAdd = async () => {
    if (!newType.trim() || newPct <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid values",
        variant: "destructive",
      });
      return;
    }

    const updated = [
      ...data.allowanceOthers,
      { type: newType.trim(), percentage: newPct },
    ];

    await updateAllowance({
      key: "allowance_others",
      value: updated,
    });

    setNewType("");
    setNewPct(0);
  };

  const handleDeleteAllowance = async (typeToDelete: string) => {
    const updated = data.allowanceOthers.filter((a) => a.type !== typeToDelete);

    await updateAllowance({
      key: "allowance_others",
      value: updated,
    });
  };

  return (
    <Card className={`${size}  my-6`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Allowances
          <InfoTooltip content="Total must equal 100%. You can edit below or add new." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Core Percentages */}
        <h2 className="text-xl font-semibold mb-2">Salary Structure (%)</h2>
        <table className="w-full table-auto border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 text-left">Component</th>
              <th className="py-2 text-right">Percentage</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(["basic", "housing", "transport"] as const).map((key) => {
              const settingKey = `${key}_percent`;
              const label = key[0].toUpperCase() + key.slice(1);
              const value = data[`${key}Percent`];
              return (
                <tr key={key}>
                  <td className=" py-2">{label}</td>
                  <td className=" py-2 text-right">
                    {editingKey === key ? (
                      <Input
                        type="number"
                        value={editedValue}
                        onChange={(e) => setEditedValue(+e.target.value)}
                      />
                    ) : (
                      `${value}%`
                    )}
                  </td>
                  <td className=" py-2 text-center">
                    {editingKey === key ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateAllowance({
                            key: settingKey,
                            value: editedValue,
                          });
                        }}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditedValue(value);
                          setEditingKey(key);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Other Allowances */}
        <h2 className="text-xl font-semibold mb-2">Other Allowances</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className=" py-2 text-left">Type</th>
              <th className=" py-2 text-right">Percentage</th>
              <th className=" py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.allowanceOthers.map((a, i) => {
              const isEditing = editingKey === a.type;
              return (
                <tr key={i}>
                  <td className=" py-2">{a.type}</td>
                  <td className=" py-2 text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedValue}
                        onChange={(e) => setEditedValue(+e.target.value)}
                      />
                    ) : a.percentage != null ? (
                      `${a.percentage}%`
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Create updated array
                          const updated = data.allowanceOthers.map(
                            (item, idx) =>
                              idx === i
                                ? { ...item, percentage: editedValue }
                                : item,
                          );
                          updateAllowance({
                            key: "allowance_others",
                            value: updated,
                          });
                          setEditingKey(null);
                        }}
                      >
                        Save
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingKey(a.type);
                            setEditedValue(a.percentage ?? 0);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAllowance(a.type)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add New Allowance */}
        <div className="mb-6 grid grid-cols-[1fr_1fr_auto] gap-2 items-end mt-10">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <Input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="e.g. Utility"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Percentage</label>
            <Input
              type="number"
              value={newPct}
              onChange={(e) => setNewPct(+e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
          <Button onClick={handleAdd} className="h-fit">
            Add
          </Button>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">
            Ensure total breakdown adds up to 100%. Current: {totalPercentage}%
          </p>
        </div>
        {!isValidTotal && (
          <p className="text-monzo-error mt-4 font-semibold">
            Total percentage must equal 100%!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
