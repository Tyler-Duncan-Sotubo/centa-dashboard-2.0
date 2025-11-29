"use client";

import { useEffect, useState } from "react";
import { FolderList } from "./_components/FolderList";
import { FileTable } from "./_components/FileTable";
import PageHeader from "@/components/pageHeader";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { FolderItem } from "@/types/documents.type";

export default function DocumentsPage() {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  // Fetch company elements, this part stays the same
  const fetchCompanyElements = async () => {
    try {
      const res = await axiosInstance.get("/api/documents/folders");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: folders,
    isLoading,
    isError,
  } = useQuery<FolderItem[]>({
    queryKey: ["folders"],
    queryFn: fetchCompanyElements,
    enabled: !!session?.backendTokens.accessToken,
  });

  useEffect(() => {
    if (folders && folders.length > 0 && !activeFolderId) {
      setActiveFolderId(folders[0].id);
    }
  }, [folders, activeFolderId]);

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const activeFolder = folders?.find((f) => f.id === activeFolderId);

  return (
    <section className="p-5">
      <PageHeader
        title="Documents"
        description="Manage your company documents and folders. Upload, organize, and access files easily."
      />
      <div className="grid grid-cols-3 gap-6 mt-10">
        <FolderList
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={setActiveFolderId}
        />
        <div className="col-span-2">
          <FileTable files={activeFolder?.files ?? []} id={activeFolderId} />
        </div>
      </div>
    </section>
  );
}
