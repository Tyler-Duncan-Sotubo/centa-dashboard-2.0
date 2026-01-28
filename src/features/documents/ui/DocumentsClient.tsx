"use client";

import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { FolderList } from "./FolderList";
import { FileTable } from "./FileTable";
import { useFolders } from "../hooks/use-folders";
import { FolderItem } from "../types/documents.type";

type FolderNode = FolderItem & { children?: FolderNode[] };

function findFolderById(
  nodes: FolderNode[] | undefined,
  id: string | null,
): FolderNode | null {
  if (!nodes || !id) return null;

  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findFolderById(n.children, id);
    if (hit) return hit;
  }
  return null;
}

export default function DocumentsClient() {
  const {
    status,
    folders,
    isLoading,
    isError,
    activeFolderId,
    setActiveFolderId,
  } = useFolders();

  const activeFolder = findFolderById(folders as FolderNode[], activeFolderId);

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="p-5">
      <PageHeader
        title="Documents"
        description="Manage your company documents and folders. Upload, organize, and access files easily."
      />
      <div className="grid grid-cols-3 gap-6 mt-10">
        <FolderList
          folders={folders as FolderNode[]}
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
