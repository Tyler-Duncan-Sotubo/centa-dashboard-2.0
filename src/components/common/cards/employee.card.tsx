import React from "react";
import { Users, Banknote } from "lucide-react";
import { Employee } from "@/types/employees.type";
import { formatCurrency } from "@/utils/formatCurrency";

export const EmployeesCards = ({
  data = [],
  deductions,
}: {
  data: Employee[] | undefined;
  deductions?: number;
}) => {
  const totalEmployees = data.length;
  const totalSalary = data.reduce(
    (acc, curr) => acc + (curr?.annualGross || 0),
    0
  );

  const formattedSalary = formatCurrency(totalSalary / 12);

  const Card = ({
    icon,
    title,
    value,
    iconColor = "bg-blue-500",
    money = false,
  }: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    iconColor?: string;
    money?: boolean;
  }) => {
    return (
      <div className="bg-white py-3 flex items-center space-x-3">
        <div
          className={`p-5 rounded-lg shadow-xl text-white self-start ${iconColor}`}
        >
          {icon}
        </div>
        <div className=" items-center">
          <h3 className="text-md font-semibold text-textSecondary">{title}</h3>
          <p className="text-xl font-bold">{money ? value : value}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        deductions ? "lg:grid-cols-3 w-[75%]" : "lg:grid-cols-2 w-1/2"
      } gap-6 py-2 `}
    >
      <Card
        icon={<Users size={20} color="black" />}
        title="Total Employees"
        value={totalEmployees}
        iconColor="bg-brand/60"
      />
      <Card
        icon={<Banknote size={20} color="black" />}
        title="Monthly Salary"
        value={formattedSalary}
        iconColor="bg-teal-400"
        money
      />
      {deductions ? (
        <Card
          icon={<Banknote size={20} color="black" />}
          title="Total Deductions"
          value={formatCurrency(deductions)}
          iconColor="bg-red-400"
          money
        />
      ) : null}
    </div>
  );
};
