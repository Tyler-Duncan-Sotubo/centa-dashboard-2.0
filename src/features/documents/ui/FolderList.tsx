import { useMemo, useState } from "react";
import {
  FaFolderOpen,
  FaFolder,
  FaLock,
  FaPen,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa6";
import { Input } from "@/shared/ui/input";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { FolderDialog } from "./FolderDialog";
import { FolderItem } from "../types/documents.type";

type FolderNode = FolderItem & { children?: FolderNode[] };

export function FolderList({
  folders,
  activeFolderId,
  onSelectFolder,
}: {
  folders: FolderNode[] | undefined;
  activeFolderId: string | null;
  onSelectFolder: (id: string) => void;
}) {
  // key: `${depth}:${folderId}`
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");

  const toggle = (depth: number, id: string) => {
    const key = `${depth}:${id}`;
    setOpenKeys((prev) => {
      const next: Record<string, boolean> = { ...prev };

      // close siblings at same depth
      for (const k of Object.keys(next)) {
        if (k.startsWith(`${depth}:`)) next[k] = false;
      }

      // toggle this one
      next[key] = !prev[key];
      return next;
    });
  };

  const matches = (n: FolderNode): boolean =>
    n.name.toLowerCase().includes(q.toLowerCase()) ||
    (n.children?.some(matches) ?? false);

  const visibleRoots = useMemo(() => {
    if (!folders) return [];
    if (!q.trim()) return folders;
    return folders.filter(matches);
  }, [folders, q]);

  const Row = ({ folder, depth }: { folder: FolderNode; depth: number }) => {
    const isActive = folder.id === activeFolderId;
    const Icon = isActive ? FaFolderOpen : FaFolder;
    const hasChildren = (folder.children?.length ?? 0) > 0;

    const isOpen = !!openKeys[`${depth}:${folder.id}`];

    return (
      <li className="space-y-1">
        <div
          className={`p-4 rounded cursor-pointer hover:bg-muted ${
            isActive ? "bg-muted font-semibold" : ""
          }`}
          style={{ paddingLeft: 16 + depth * 16 }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 min-w-0">
                {hasChildren ? (
                  <button
                    type="button"
                    className="p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(depth, folder.id);
                    }}
                    aria-label={isOpen ? "Collapse folder" : "Expand folder"}
                  >
                    {isOpen ? (
                      <FaChevronDown
                        size={14}
                        className="text-muted-foreground"
                      />
                    ) : (
                      <FaChevronRight
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                  </button>
                ) : (
                  <span className="w-6" />
                )}

                <Icon size={25} className="text-monzo-secondary shrink-0" />
                <p className="text-md truncate">{folder.name}</p>
              </div>

              <div className="shrink-0">
                {folder.isSystem ? (
                  <FaLock size={16} className="text-muted-foreground" />
                ) : (
                  <div className="flex items-center gap-2">
                    <FolderDialog
                      mode="edit"
                      folder={folder}
                      trigger={<FaPen size={16} />}
                    />
                    <ConfirmDeleteDialog id={folder.id} type="folder" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <p className="text-sm text-muted-foreground font-semibold">
                {folder.files.length}{" "}
                {folder.files.length === 1 ? "file" : "files"}
              </p>
            </div>
          </div>
        </div>

        {hasChildren && isOpen && (
          <ul className="space-y-1">
            {folder.children!.map((child) => (
              <Row key={child.id} folder={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-2 w-full h-[calc(100vh-220px)] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Folders</h2>
        <FolderDialog mode="create" />
      </div>

      <Input
        placeholder="Search folders..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <ul className="space-y-1 mt-3">
        {visibleRoots.map((folder) => (
          <Row key={folder.id} folder={folder} depth={0} />
        ))}
      </ul>
    </div>
  );
}
