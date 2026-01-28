/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { CheckCircle } from "lucide-react";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { Checkbox } from "@/shared/ui/checkbox";
import { Skeleton } from "@/shared/ui/skeleton";
import { useSession } from "next-auth/react";

type RuleType = "self" | "peer" | "manager_to_employee" | "employee_to_manager";

type RuleScope = {
  officeOnly?: boolean;
  departmentOnly?: boolean;
  offices?: string[];
  departments?: string[];
};

type Rule = {
  type: RuleType;
  enabled: boolean;
  scope: RuleScope;
};

type FeedbackSettingsState = {
  enableEmployeeFeedback: boolean;
  enableManagerFeedback: boolean;
  allowAnonymous: boolean;
  rules: {
    employee: Rule[];
    manager: Rule[];
  };
};

export default function FeedbackSettings() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [settings, setSettings] = useState<FeedbackSettingsState | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const showSaved = (key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 3000);
  };

  const { isLoading, isError } = useQuery({
    queryKey: ["feedback-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback/settings");
      const data = res.data.data;

      const structured: FeedbackSettingsState = {
        enableEmployeeFeedback: data.enableEmployeeFeedback ?? false,
        enableManagerFeedback: data.enableManagerFeedback ?? false,
        allowAnonymous: data.allowAnonymous ?? false,
        rules: {
          employee: data.rules?.employee ?? [],
          manager: data.rules?.manager ?? [],
        },
      };

      setSettings(structured);
      return structured;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const updateTopLevel = async (key: keyof FeedbackSettingsState) => {
    if (!settings) return;
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });

    try {
      await axios.patch("/api/feedback/settings", { [key]: newVal });
      showSaved(key);
    } catch (err: any) {
      toast({
        title: `Failed to update ${key}`,
        variant: "destructive",
        description: err.response?.data?.message || "An error occurred",
      });
    }
  };

  const updateRule = async (
    group: "employee" | "manager",
    updated: Partial<Rule> & { type: RuleType },
  ) => {
    if (!settings) return;

    const rules = settings.rules[group];
    const current = rules.find((r) => r.type === updated.type);
    if (!current) return;

    const updatedRule: Rule = {
      ...current,
      ...updated,
      scope: {
        ...current.scope,
        ...updated.scope,
      },
    };

    const updatedGroup = rules.map((r) =>
      r.type === updatedRule.type ? updatedRule : r,
    );

    setSettings({
      ...settings,
      rules: {
        ...settings.rules,
        [group]: updatedGroup,
      },
    });

    try {
      await axios.patch(`/api/feedback/settings/rules`, {
        group,
        type: updatedRule.type,
        enabled: updatedRule.enabled,
        scope: updatedRule.scope ?? {},
      });
      showSaved(`${group}-${updatedRule.type}`);
    } catch (err: any) {
      toast({
        title: `Failed to update rule: ${updatedRule.type}`,
        variant: "destructive",
        description: err.response?.data?.message || "An error occurred",
      });
    }
  };

  const labelMap: Record<RuleType, string> = {
    self: "Self",
    peer: "Peer",
    employee_to_manager: "Employee → Manager",
    manager_to_employee: "Manager → Employee",
  };

  const feedbackTypeDescriptions: Record<RuleType, string> = {
    self: "Reflect on their own performance and contributions.",
    peer: "Get feedback from peers on collaboration and teamwork.",
    employee_to_manager: "Allow employees to assess their managers.",
    manager_to_employee: "Managers provide performance feedback to employees.",
  };

  const Saved = ({ k }: { k: string }) =>
    savedKey === k ? (
      <div className="flex items-center gap-1 ml-2">
        <CheckCircle size={16} className="text-green-400" />
        <span className="text-green-400 text-xs">Saved</span>
      </div>
    ) : null;

  const renderGroupRules = (group: "employee" | "manager") => {
    const rules = settings?.rules[group] || [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        {rules.map((rule) => {
          const key = `${group}-${rule.type}`;
          return (
            <Card key={rule.type} className="min-h-60">
              <CardHeader className="flex flex-col gap-2 justify-between items-start">
                <div className="flex w-full justify-between items-center">
                  <Label className="font-semibold">{labelMap[rule.type]}</Label>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        updateRule(group, { type: rule.type, enabled: checked })
                      }
                    />
                    <Saved k={key} />
                  </div>
                </div>
                <p className="text-md text-muted-foreground">
                  {feedbackTypeDescriptions[rule.type]}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {rule.enabled && (
                  <div
                    className="space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-officeOnly`}
                        checked={rule.scope.officeOnly}
                        onCheckedChange={(checked) =>
                          updateRule(group, {
                            type: rule.type,
                            scope: { officeOnly: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor={`${key}-officeOnly`} className="text-sm">
                        Restrict to same office
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-departmentOnly`}
                        checked={rule.scope.departmentOnly}
                        onCheckedChange={(checked) =>
                          updateRule(group, {
                            type: rule.type,
                            scope: { departmentOnly: checked as boolean },
                          })
                        }
                      />
                      <label
                        htmlFor={`${key}-departmentOnly`}
                        className="text-sm"
                      >
                        Restrict to same department
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  return (
    <div className="space-y-14 max-w-4xl">
      <div className="space-y-6">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex gap-2">
            <h3 className="text-2xl font-semibold">
              Enable 360 Feedback for Employees
            </h3>
            <Saved k="enableEmployeeFeedback" />
          </div>
          <Switch
            checked={settings?.enableEmployeeFeedback}
            onCheckedChange={() => updateTopLevel("enableEmployeeFeedback")}
          />
        </div>
        {settings?.enableEmployeeFeedback ? (
          <div>{renderGroupRules("employee")}</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-[30vh] col-span-1" />
            <Skeleton className="h-[30vh] col-span-1" />
            <Skeleton className="h-[30vh] col-span-1" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex gap-2">
            <h3 className="text-2xl font-semibold">
              Enable 360 Feedback for Managers
            </h3>
            <Saved k="enableManagerFeedback" />
          </div>
          <Switch
            checked={settings?.enableManagerFeedback}
            onCheckedChange={() => updateTopLevel("enableManagerFeedback")}
          />
        </div>
        {settings?.enableManagerFeedback ? (
          <div>{renderGroupRules("manager")}</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-[30vh] col-span-1" />
            <Skeleton className="h-[30vh] col-span-1" />
            <Skeleton className="h-[30vh] col-span-1" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-semibold">
              Allow Anonymous 360 Feedback
            </h3>
            <Saved k="allowAnonymous" />
          </div>
          <Switch
            checked={settings?.allowAnonymous}
            onCheckedChange={() => updateTopLevel("allowAnonymous")}
          />
        </div>
      </div>
    </div>
  );
}
