"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, HeartPulse, Dumbbell, Gift } from "lucide-react";
import { FaEdit, FaTooth } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import BenefitModal, { benefitSchema } from "./_components/AddBenefitModal";
import PageHeader from "@/components/pageHeader";
import { BenefitGroupSheet } from "./_components/BenefitGroupSheet";
import { DataTable } from "@/components/DataTable";
import { BenefitsGroupColumns } from "./_components/BenefitsGroupColumns";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/utils/formatCurrency";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { z } from "zod";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const benefitTypes = [
  "Health",
  "Dental",
  "Wellness",
  "Perks",
  "Life Insurance",
  "Disability Insurance",
  "Retirement Plans",
  "Commuter Benefits",
];

const categoryIcons: Record<string, () => JSX.Element> = {
  Health: () => <HeartPulse className="w-6 h-6 text-red-500" />,
  Dental: () => <FaTooth className="w-6 h-6 text-blue-500" />,
  Wellness: () => <Dumbbell className="w-6 h-6 text-green-500" />,
  Perks: () => <Gift className="w-6 h-6 text-yellow-500" />,
};

type BenefitPlan = {
  id: string;
  name: string;
  description: string;
  coverage?: string;
  category: string;
  cost?: Record<string, number>;
};

export default function BenefitsPage() {
  const axiosAuth = useAxiosAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = React.useState("plans");
  const { data: session } = useSession();

  const fetchBenefitsPlans = async () => {
    try {
      const res = await axiosAuth.get("/api/benefit-plan");
      const data = res.data.data as BenefitPlan[];
      setPlans(data);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { isLoading: isLoadingBenefits } = useQuery({
    queryKey: ["benefits"],
    queryFn: fetchBenefitsPlans,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  const fetchBenefitsGroups = async () => {
    try {
      const res = await axiosAuth.get("/api/benefit-groups");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["benefit-groups"],
    queryFn: fetchBenefitsGroups,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  const groupedPlans = useMemo(() => {
    return benefitTypes.map((category) => ({
      category,
      icon: categoryIcons[category],
      plans: plans.filter((plan) => plan.category === category),
    }));
  }, [plans]);

  if (isLoading || isLoadingBenefits) return <Loading />;
  if (isError) return <p>Error loading data</p>;

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
                disabled={!data || data.length === 0}
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
                      {plans.map((plan) => (
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
                                      {label}: {formatCurrency(amount)}
                                    </div>
                                  )
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
          <DataTable columns={BenefitsGroupColumns} data={data} />
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
