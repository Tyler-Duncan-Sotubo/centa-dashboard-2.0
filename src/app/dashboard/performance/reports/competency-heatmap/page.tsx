"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "@/shared/ui/page-header";
import { ReportFilters } from "../_components/ReportFilters";

// --- Column definition for DataTable ---
type Row = { competency: string; level: string; count: number };
const columns: ColumnDef<Row>[] = [
  { accessorKey: "competency", header: "Competency" },
  { accessorKey: "level", header: "Level" },
  { accessorKey: "count", header: "Count" },
];

export default function CompetencyHeatmapPage() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const [filters, setFilters] = React.useState({
    cycleId: undefined,
  });

  const {
    data: heatmap = {},
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["competency-heatmap", filters.cycleId],
    queryFn: async () => {
      const params = filters.cycleId ? { cycleId: filters.cycleId } : {};
      const res = await axios.get(
        "/api/performance-report/competency-heatmap",
        {
          params,
        },
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  // --- Transform for DataTable ---
  const rows: Row[] = React.useMemo(
    () =>
      Object.entries(heatmap).flatMap(([competency, levels]) =>
        Object.entries(levels as Record<string, string | number>).map(
          ([level, count]) => ({
            competency,
            level,
            count: Number(count),
          }),
        ),
      ),
    [heatmap],
  );

  // --- Transform for RadarChart (sum all levels for each competency) ---
  const radarData = React.useMemo(
    () =>
      Object.entries(heatmap).map(([competency, levels]) => ({
        competency,
        value: Object.values(levels as Record<string, string | number>).reduce(
          (a, b) => Number(a) + Number(b),
          0,
        ),
      })),
    [heatmap],
  );

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading competency heatmap</div>;

  return (
    <div className="px-5">
      <PageHeader
        title="Competency Heatmap"
        description="Visual representation of employee competencies across different levels."
      />

      <div className="my-6">
        <ReportFilters
          filters={filters}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setFilters={setFilters as any}
          appraisal={true}
          onApply={refetch}
          exportPath="/api/performance-report/export-competency-heatmap"
          allowedFormats={["csv", "pdf"]}
          showCycle={true}
          showEmployee={false}
          showDepartment={false}
          showType={false}
          showMinimumScore={false}
          showSearch={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-10">
        {/* DataTable Section */}

        {/* Radar Chart Section */}
        <div className="flex items-center justify-center h-full w-full">
          <ResponsiveContainer width="100%" aspect={1.5}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competency" />
              <PolarRadiusAxis />
              <Radar
                name="Count"
                dataKey="value"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.4}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <DataTable columns={columns} data={rows} />
        </div>
      </div>
    </div>
  );
}
