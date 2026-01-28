"use client";

import { useMemo, useState } from "react";
import type { Employee } from "@/types/employees.type";

export function useEmployeeSearch(employees: Employee[] | undefined) {
  const [searchTerm, setSearchTerm] = useState("");

  const activeEmployees = useMemo(() => {
    return (employees ?? []).filter((e) => e.employmentStatus === "active");
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return activeEmployees;

    return activeEmployees.filter((emp) =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q),
    );
  }, [activeEmployees, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    activeEmployees,
    filteredEmployees,
  };
}
