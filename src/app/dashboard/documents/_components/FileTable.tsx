import { useState, useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { FileItem } from "@/types/documents.type";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import {
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";
import Link from "next/link";
import { formatDateHumanReadable } from "@/utils/formatDateHumanReadable";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const getIconByExtension = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";

  switch (ext) {
    case "pdf":
      return <FaFilePdf className="text-red-600 h-12 w-5" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <FaFileImage className="text-blue-500 h-12 w-5" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-700 h-12 w-5" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-green-600 h-12 w-5" />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint className="text-orange-500 h-12 w-5" />;
    default:
      return <FaFileAlt className="text-gray-600 h-12 w-5" />;
  }
};

export function FileTable({
  files,
  id,
}: {
  files: FileItem[];
  id: string | null;
}) {
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  const columns = [
    {
      accessorKey: "name",
      header: "File Name",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded",
      cell: ({ row }: { row: { original: FileItem } }) =>
        formatDateHumanReadable(new Date(row.original.createdAt)),
    },
    {
      id: "actions",
      header: "Preview",
      cell: ({ row }: { row: { original: FileItem } }) => (
        <div className="flex items-center justify-center">
          <Link
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform text-center"
            title="Open file"
          >
            {getIconByExtension(row.original.url)}
          </Link>
        </div>
      ),
    },
    {
      id: "delete",
      cell: ({ row }: { row: { original: FileItem } }) => (
        <ConfirmDeleteDialog id={row.original.id} type="file" />
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search files..."
          className="w-[400px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<FaFileAlt />}
        />
        <UploadDocumentDialog folderId={id} />
      </div>
      <DataTable columns={columns} data={filteredFiles} />
    </div>
  );
}
