import React, { useState } from "react";
import { FolderKanban, X, Plus, Trash2, Copy, Edit2, Download, Clock } from "lucide-react";
import { ProjectSummary } from "../../types/project";

interface ProjectGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectSummary[];
  currentProjectId: string;
  onOpenProject: (id: string) => void;
  onCreateNew: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onExportProject: (id: string) => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onOpenProject,
  onCreateNew,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  onExportProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  if (!isOpen) return null;

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setNameInput(currentName);
  };

  const saveRename = (id: string) => {
    if (nameInput.trim()) {
      onRenameProject(id, nameInput.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      id="project-gallery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#A88BFF]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Project Gallery</h2>
              <p className="text-xs text-neutral-400">
                {projects.length} saved project{projects.length === 1 ? "" : "s"} in IndexedDB storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNew();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7C5CFF] hover:bg-[#6847FF] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Artwork</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
              <FolderKanban className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="text-sm font-medium text-neutral-300">No saved projects yet</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Create a new canvas or save your current artwork to find it here anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const isCurrent = proj.id === currentProjectId;
                const isEditing = editingId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border bg-[#1E1E1E] transition-all hover:shadow-xl ${
                      isCurrent
                        ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/25"
                        : "border-[#2A2A2A] hover:border-neutral-600"
                    }`}
                  >
                    {/* Thumbnail click to open */}
                    <div
                      onClick={() => {
                        onOpenProject(proj.id);
                        onClose();
                      }}
                      className="relative h-44 bg-[#141414] overflow-hidden cursor-pointer flex items-center justify-center"
                    >
                      {proj.thumbnail ? (
                        <img
                          src={proj.thumbnail}
                          alt={proj.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-xs text-neutral-600 font-mono">No Preview</div>
                      )}

                      {isCurrent && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#7C5CFF] text-[10px] font-semibold text-white shadow-sm">
                          Current
                        </span>
                      )}

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-neutral-300">
                        {proj.width} × {proj.height}
                      </span>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={nameInput}
                            autoFocus
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={() => saveRename(proj.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(proj.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full bg-neutral-900 border border-[#7C5CFF] rounded px-1.5 py-0.5 text-xs text-white outline-none"
                          />
                        ) : (
                          <h3
                            onDoubleClick={() => startRename(proj.id, proj.name)}
                            className="font-semibold text-xs text-white truncate cursor-pointer hover:text-[#A88BFF]"
                            title={proj.name}
                          >
                            {proj.name}
                          </h3>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>{formatTimeAgo(proj.updatedAt)}</span>
                        </span>
                        <span>{proj.layerCount} layer{proj.layerCount === 1 ? "" : "s"}</span>
                      </div>

                      {/* Actions toolbar */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenProject(proj.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-[#7C5CFF]/10 hover:bg-[#7C5CFF] text-[#A88BFF] hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Open
                        </button>

                        <div className="flex items-center gap-1 text-neutral-400">
                          <button
                            type="button"
                            onClick={() => startRename(proj.id, proj.name)}
                            title="Rename"
                            className="p-1 rounded hover:text-white hover:bg-neutral-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateProject(proj.id)}
                            title="Duplicate"
                            className="p-1 rounded hover:text-white hover:bg-neutral-800"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onExportProject(proj.id)}
                            title="Quick Export PNG"
                            className="p-1 rounded hover:text-white hover:bg-neutral-800"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(proj.id)}
                            title="Delete Artwork"
                            className="p-1 rounded hover:text-rose-400 hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
