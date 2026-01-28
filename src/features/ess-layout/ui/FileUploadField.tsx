import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, FileImage } from "lucide-react";
import { useState } from "react";

export function FileUploadField({
  value,
  onChange,
}: {
  value: string | null; // base64 string
  onChange: (fileBase64: string | null) => void;
}) {
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const base64 = await toBase64(file);
      setFileInfo({ name: file.name, type: file.type });
      onChange(base64);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "image/*": [],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 border-gray-300 hover:border-primary rounded-lg p-6 text-center cursor-pointer transition-colors"
    >
      <input {...getInputProps()} />
      {value && fileInfo ? (
        <div className="flex flex-col items-center space-y-2">
          {fileInfo.type === "application/pdf" ? (
            <FileText size={32} />
          ) : (
            <FileImage size={32} />
          )}
          <p className="text-sm text-muted-foreground">{fileInfo.name}</p>
        </div>
      ) : isDragActive ? (
        <p className="text-primary">Drop the file here...</p>
      ) : (
        <div className="flex flex-col items-center text-muted-foreground space-y-2">
          <UploadCloud size={32} />
          <p>Drag & drop a PDF or image file, or click to browse</p>
        </div>
      )}
    </div>
  );
}
