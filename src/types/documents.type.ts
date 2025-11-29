export type FileItem = {
  id: string;
  name: string;
  type: string; // e.g., "pdf", "csv"
  category: string; // e.g., "reports", "payroll"
  url: string;
  createdAt: string; // ISO string
};

export type FolderItem = {
  id: string;
  name: string;
  files: FileItem[];
  isSystem: boolean;
};
