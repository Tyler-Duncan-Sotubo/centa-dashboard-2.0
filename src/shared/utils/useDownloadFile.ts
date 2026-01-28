import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useToast } from "@/shared/hooks/use-toast";

export function useDownloadFile(token?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const download = async (endpoint: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fileUrl = res.data?.data?.url?.url ?? res.data?.data?.url ?? null;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: "No file URL found.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { download, isLoading };
}
