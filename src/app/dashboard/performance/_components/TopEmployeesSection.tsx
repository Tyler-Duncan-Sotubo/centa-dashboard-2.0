import React from "react";
import { Badge } from "@/shared/ui/badge";
import { Avatars } from "@/shared/ui/avatars";

// Group by department
function groupByDepartment(data: TopEmployee[]) {
  return data.reduce(
    (acc, emp) => {
      acc[emp?.departmentName] = acc[emp?.departmentName] || [];
      acc[emp?.departmentName].push(emp);
      return acc;
    },
    {} as Record<string, TopEmployee[]>,
  );
}

interface TopEmployee {
  employeeId: string;
  employeeName: string;
  jobRoleName: string;
  finalScore: number;
  promotionRecommendation: string;
  departmentName: string;
  source: string;
}

interface TopEmployeesSectionProps {
  employees: TopEmployee[];
}

export function TopEmployeesSection({ employees }: TopEmployeesSectionProps) {
  if (!employees?.length) return null;

  const grouped = groupByDepartment(employees);

  return (
    <div className="space-y-8 w-full mt-12">
      {Object.entries(grouped).map(([dept, emps]) => {
        const employeesArr = emps as TopEmployee[];
        return (
          <div
            key={dept}
            className="mb-4 p-4 py-6 border rounded-md shadow-2xs"
          >
            <div className="space-y-2">
              {employeesArr.map((employee: TopEmployee) => (
                <div key={employee?.employeeId}>
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold">Top Performer</h2>
                      <Badge variant="paid" className="capitalize">
                        {employee?.source}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {Avatars({ name: employee?.employeeName })}
                    <div>
                      <div className="font-bold">{employee?.employeeName}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">{dept}</span>
                        <span className=" text-muted-foreground">
                          {employee?.jobRoleName}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="approved">
                          Score: {employee?.finalScore}
                        </Badge>
                        <Badge
                          variant={
                            employee?.promotionRecommendation === "hold"
                              ? "pending"
                              : "completed"
                          }
                          className="capitalize"
                        >
                          {employee?.promotionRecommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
