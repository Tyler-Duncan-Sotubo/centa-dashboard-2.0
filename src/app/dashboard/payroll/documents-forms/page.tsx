"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";
import TaxFilingDocuments from "../_components/TaxFilingDocuments";
import TaxForms from "../_components/TaxForms";
import { ClientGuard } from "@/lib/guard/ClientGuard";

const DocumentAndForms = () => {
  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <div className="px-5">
        <PageHeader
          title="Documents & Forms"
          description="Manage your documents and forms"
        />

        <Tabs defaultValue="documents" className="w-full mt-10">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <TaxFilingDocuments />
          </TabsContent>

          <TabsContent value="forms">
            <TaxForms />
          </TabsContent>
        </Tabs>
      </div>
    </ClientGuard>
  );
};

export default DocumentAndForms;
