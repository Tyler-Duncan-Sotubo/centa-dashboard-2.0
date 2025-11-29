"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import React from "react";

interface EmployeeVarianceRow {
  employee: string;
  metric: string;
  variance: number;
  [key: string]: string | number;
}

export default function EmployeeVarianceTable({
  data,
}: {
  data: {
    rows: EmployeeVarianceRow[];
    columns: { field: string; title: string }[];
  };
}) {
  const previousDate = data.columns.find((c) =>
    c.title?.startsWith("Previous")
  )?.field;
  const currentDate = data.columns.find((c) =>
    c.title?.startsWith("Current")
  )?.field;

  const grouped = data.rows.reduce((acc, row) => {
    const name = row.employee;
    if (!acc[name]) acc[name] = [];
    acc[name].push(row);
    return acc;
  }, {} as Record<string, EmployeeVarianceRow[]>);

  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4">Employee Payroll Variance</h2>
      <Table className="text-md border shadow-sm rounded-md">
        <TableHeader className="bg-monzo-primary">
          <TableRow>
            <TableHead />
            <TableHead className="font-bold">Metric</TableHead>
            <TableHead className="font-bold">{previousDate}</TableHead>
            <TableHead className="font-bold">{currentDate}</TableHead>
            <TableHead className="font-bold">Variance (₦)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No employee variance data available.
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(grouped).map(([employee, metrics]) => (
              <React.Fragment key={employee}>
                <TableRow>
                  <TableCell colSpan={5} className="font-bold bg-muted">
                    {employee}
                  </TableCell>
                </TableRow>
                {metrics.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell />
                    <TableCell>{row.metric}</TableCell>
                    <TableCell>
                      {row[previousDate as keyof EmployeeVarianceRow]}
                    </TableCell>
                    <TableCell>
                      {row[currentDate as keyof EmployeeVarianceRow]}
                    </TableCell>
                    <TableCell>{row.variance}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
