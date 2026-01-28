"use client";

import { useDownloadFile } from "@/shared/utils/useDownloadFile";

export function useDepartmentAttendanceExport(token?: string) {
  const { download, isLoading } = useDownloadFile(token);

  const exportDepartmentReport = async (yearMonth: string) => {
    await download(
      `/api/attendance-report/gen-department-report?yearMonth=${yearMonth}`,
    );
  };

  return { exportDepartmentReport, isExporting: isLoading };
}
