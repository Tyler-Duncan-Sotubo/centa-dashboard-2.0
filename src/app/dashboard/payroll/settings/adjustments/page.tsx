"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PayrollBonuses from "./payroll-bonuses/PayrollBonuses";
import PayrollDeductions from "./payroll-deductions/PayrollDeductions";

export default function PayrollSettingsPage() {
  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold mb-6">Payroll Settings</h1>

      <Tabs defaultValue="deductions" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions">
          <PayrollDeductions />
        </TabsContent>
        <TabsContent value="bonuses">
          <PayrollBonuses />
        </TabsContent>
      </Tabs>
    </div>
  );
}
