"use client";

import { useDownloadFile } from "@/shared/utils/useDownloadFile";

export function useAttendanceReportExport(token?: string) {
  const { download, isLoading } = useDownloadFile(token);

  const exportReport = async (endpoint: string, yearMonth: string) => {
    await download(`/api/attendance-report/${endpoint}?yearMonth=${yearMonth}`);
  };

  return { exportReport, isExporting: isLoading };
}
