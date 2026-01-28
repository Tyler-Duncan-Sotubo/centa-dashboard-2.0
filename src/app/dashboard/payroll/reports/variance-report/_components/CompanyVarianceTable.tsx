"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui/table";

export default function CompanyVarianceTable({
  data,
}: {
  data: {
    rows: Record<string, unknown>[];
    columns: { field: string; title: string }[];
  };
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Company Payroll Variance</h2>
      <Table className="text-md border shadow-2xs rounded-md">
        <TableHeader className="bg-monzo-primary">
          <TableRow>
            {data.columns.map((col) => (
              <TableHead key={col.field} className="font-bold">
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={data.columns.length}
                className="text-center py-8 text-muted-foreground"
              >
                No company variance data available.
              </TableCell>
            </TableRow>
          ) : (
            data.rows.map((row, idx) => (
              <TableRow key={idx}>
                {data.columns.map((col) => (
                  <TableCell key={col.field}>
                    {String(row[col.field] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
