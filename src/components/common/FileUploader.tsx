"use client";

import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { UploadCloud, FileText, Trash } from "lucide-react";
import Image from "next/image";
import { toBase64 } from "@/utils/toBase64";

export function FileUploader({
  value,
  onChange,
  label = "Upload File",
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/plain": [".txt"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      [".pptx"],
    "image/*": [".jpg", ".jpeg", ".png"],
  },
}: {
  value: { name: string; type: string; base64: string } | null;
  onChange: (
    file: { name: string; type: string; base64: string } | null
  ) => void;
  label?: string;
  accept?: { [key: string]: string[] };
}) {
  const file = value;
  const [fileName, setFileName] = useState(file?.name || "");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const selected = acceptedFiles?.[0];
      if (!selected) return;

      const base64 = await toBase64(selected);

      const receiptData = {
        name: selected.name,
        type: selected.type,
        base64,
      };

      onChange(receiptData);
      setFileName(selected.name);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <>
      {file ? (
        <div className="relative gap-2 border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
          {file.type?.includes("image") ? (
            <Image src={file.base64} alt="Preview" width={100} height={100} />
          ) : (
            <FileText className="w-6 h-6 text-primary mb-1" />
          )}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setFileName("");
            }}
            className="text-red-600 mt-2 absolute top-2 right-2 hover:underline"
          >
            <Trash size={20} className="mr-1" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
        >
          <input {...getInputProps()} />
          <UploadCloud size={36} className="text-gray-600 mb-2" />
          <p className="text-gray-700 text-sm text-center">
            {isDragActive
              ? "Drop the file here..."
              : `Click or drag to ${label.toLowerCase()}`}
          </p>
          <p className="text-gray-500 text-xs mt-1">{fileName}</p>
        </div>
      )}
    </>
  );
}
