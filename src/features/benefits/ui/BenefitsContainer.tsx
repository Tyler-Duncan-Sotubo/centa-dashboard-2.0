"use client";

import React, { useMemo, useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Plus } from "lucide-react";
import { FaEdit } from "react-icons/fa";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { DataTable } from "@/shared/ui/data-table";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { z } from "zod";
import { useBenefitPlans } from "../hooks/use-benefit-plans";
import { useBenefitGroups } from "../hooks/use-benefit-groups";
import { benefitTypes, categoryIcons } from "../config/benefit.constants";
import { BenefitGroupSheet } from "./BenefitGroupSheet";
import { BenefitsGroupColumns } from "./BenefitsGroupColumns";
import BenefitModal from "./BenefitModal";
import { benefitSchema } from "../schema/benefit.schema";

export function BenefitsContainer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");

  const { plans, isLoadingBenefits, isErrorBenefits } = useBenefitPlans();
  const { groups, isLoadingGroups, isErrorGroups } = useBenefitGroups();

  const groupedPlans = useMemo(() => {
    return benefitTypes.map((category) => ({
      category,
      icon: categoryIcons[category],
      plans: (plans ?? []).filter((plan: any) => plan.category === category),
    }));
  }, [plans]);

  if (isLoadingGroups || isLoadingBenefits) return <Loading />;
  if (isErrorGroups || isErrorBenefits) return <p>Error loading data</p>;

  return (
    <div className="px-5">
      <div className="flex justify-between items-center mb-4">
        <PageHeader
          title="Benefits"
          description="Manage your employee benefits and perks."
        />

        <div className="flex justify-end mb-4">
          {activeTab === "plans" && (
            <div className="space-x-2">
              <Select
                disabled={!groups || groups.length === 0}
                onValueChange={(value) => {
                  setIsOpen(true);
                  setSelectedCategory(value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <Plus className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Add New Benefit" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="space-x-2">
              <BenefitGroupSheet />
            </div>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="plans"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-10"
      >
        <TabsList>
          <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
          <TabsTrigger value="groups">Benefit Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          {plans.length === 0 ? (
            <p className="text-muted-foreground mt-4">
              No benefits have been added yet.
            </p>
          ) : (
            <table className="w-full text-sm border rounded-md overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-2">Plan Name</th>
                  <th className="text-left px-4 py-2">Description</th>
                  <th className="text-left px-4 py-2">Coverage</th>
                  <th className="text-left px-4 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {groupedPlans
                  .filter(({ plans }) => plans.length > 0)
                  .map(({ category, icon, plans }) => (
                    <React.Fragment key={category}>
                      <tr>
                        <td
                          colSpan={4}
                          className="bg-gray-50 font-semibold text-md px-4 py-2"
                        >
                          <div className="flex items-center space-x-2">
                            {icon?.()}
                            <span>{category}</span>
                          </div>
                        </td>
                      </tr>

                      {plans.map((plan: any) => (
                        <tr key={plan.id} className="border-t mb-10 text-md">
                          <td className="px-4 py-4 font-semibold text-lg flex justify-between items-center">
                            {plan.name}
                          </td>

                          <td className="px-4 py-2 text-muted-foreground">
                            {plan.description}
                          </td>

                          <td className="px-4 py-2 text-muted-foreground">
                            {plan.cost && Object.keys(plan.cost).length > 0
                              ? Object.entries(plan.cost).map(
                                  ([label, amount]) => (
                                    <div key={label} className="block">
                                      {label}:{" "}
                                      {formatCurrency(amount as number)}
                                    </div>
                                  ),
                                )
                              : "—"}
                          </td>

                          <td className="px-4 py-2">
                            <button
                              onClick={() => {
                                setSelectedCategory(plan.category);
                                setSelectedPlan(plan);
                                setIsOpen(true);
                              }}
                            >
                              <FaEdit className="mr-2" />
                            </button>

                            <DeleteIconDialog
                              itemId={plan.id}
                              type="benefits"
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          )}
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <DataTable columns={BenefitsGroupColumns} data={groups} />
        </TabsContent>
      </Tabs>

      <BenefitModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        benefitName={selectedCategory}
        initialData={
          selectedPlan as unknown as z.infer<typeof benefitSchema> & {
            id?: string;
          }
        }
      />
    </div>
  );
}
