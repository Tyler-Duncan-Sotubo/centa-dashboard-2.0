"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeesTable } from "@/components/common/tables/employees.table";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { EmployeesCards } from "@/components/common/cards/employee.card";
import { Employee } from "@/types/employees.type";
import AddMultipleEmployeesModal from "./AddMultipleEmployeesModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa6";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";
import { SendOnboardingInviteSheet } from "../onboarding/_components/SendOnboardingInviteSheet";

const Employees = () => {
  const [isMultipleOpen, setIsMultipleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/api/employees/all");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: employees,
    isLoading: loadingEmployees,
    isError: errorEmployees,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || loadingEmployees) return <Loading />;
  if (errorEmployees) return <p>Error loading data</p>;

  const allEmployees = Array.isArray(employees) ? employees : [];
  const onlyEmployees = allEmployees.filter((e) => e.role === "employee");
  const onlyManagers = allEmployees.filter((e) => e.role === "manager");

  const getCardData = () => {
    switch (activeTab) {
      case "employee":
        return onlyEmployees;
      case "manager":
        return onlyManagers;
      case "all":
      default:
        return allEmployees;
    }
  };

  return (
    <section className="p-5">
      <PageHeader
        title="Employees"
        description="Manage your employees and their information."
      >
        <SendOnboardingInviteSheet />

        <Button onClick={() => setIsMultipleOpen(true)}>
          <Upload size={16} />
          Upload Employees
        </Button>

        <Link href="/dashboard/employees/invite">
          <Button>
            <FaUserPlus size={16} />
            Add Employees
          </Button>
        </Link>
      </PageHeader>

      {/* Conditionally rendered Employee Cards above Tabs */}
      {allEmployees.length > 0 && (
        <div className="mt-6">
          <EmployeesCards data={getCardData()} />
        </div>
      )}

      {allEmployees.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Employees Found"
            description="It seems you haven't added any employees yet. Start by adding your first employee."
            image={
              "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585356/employees_bpfi3q.svg"
            }
            actionLabel="Add Employee"
            actionHref="/dashboard/employees/invite"
          />
        </div>
      ) : (
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mt-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="employee">Employees</TabsTrigger>
            <TabsTrigger value="manager">Managers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <EmployeesTable data={allEmployees} />
          </TabsContent>

          <TabsContent value="employee" className="mt-10">
            <EmployeesTable data={onlyEmployees} />
          </TabsContent>

          <TabsContent value="manager" className="mt-10">
            <EmployeesTable data={onlyManagers} />
          </TabsContent>
        </Tabs>
      )}

      <AddMultipleEmployeesModal
        isOpen={isMultipleOpen}
        onClose={() => setIsMultipleOpen(false)}
      />
    </section>
  );
};

export default Employees;
