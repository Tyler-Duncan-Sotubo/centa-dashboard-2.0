"use client";

import { useDownloadFile } from "@/shared/utils/useDownloadFile";

export function useReportExport(token?: string) {
  const { download, isLoading } = useDownloadFile(token);

  const exportByUrl = async (url: string) => {
    await download(url);
  };

  const exportAttendanceReport = async (
    endpoint: string,
    yearMonth: string,
  ) => {
    await download(`/api/attendance-report/${endpoint}?yearMonth=${yearMonth}`);
  };

  return {
    exportByUrl,
    exportAttendanceReport,
    isExporting: isLoading,
  };
}
