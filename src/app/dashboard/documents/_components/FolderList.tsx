import { FolderItem } from "@/types/documents.type";
import { FaFolderOpen, FaFolder, FaLock, FaPen } from "react-icons/fa6";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { FolderDialog } from "./FolderDialog";

export function FolderList({
  folders,
  activeFolderId,
  onSelectFolder,
}: {
  folders: FolderItem[] | undefined;
  activeFolderId: string | null;
  onSelectFolder: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Folders</h2>
        <FolderDialog mode="create" />
      </div>

      <ul className="space-y-1">
        {folders &&
          folders.map((folder) => {
            const isActive = folder.id === activeFolderId;
            const Icon = isActive ? FaFolderOpen : FaFolder;

            return (
              <li
                key={folder.id}
                className={`p-4 rounded cursor-pointer hover:bg-muted ${
                  isActive ? "bg-muted font-semibold" : ""
                }`}
                onClick={() => onSelectFolder(folder.id)}
              >
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Icon and folder name */}
                      <div className="flex items-center space-x-2">
                        <Icon size={25} className="text-monzo-secondary" />
                        <p className="text-md">{folder.name}</p>
                      </div>

                      {/* Right: Lock icon or Edit/Delete actions */}
                      <div>
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
                    <p className="text-sm text-muted-foreground font-semibold">
                      {folder.files.length}{" "}
                      {folder.files.length === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
