import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Save,
  FolderKanban,
  FilePlus,
  Upload,
  Undo2,
  Redo2,
  Trash2,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Wand2,
  Sliders,
  HelpCircle,
  Check,
} from "lucide-react";

interface TopNavbarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  isSaved: boolean;
  onOpenExport: () => void;
  onOpenNewCanvas: () => void;
  onOpenGallery: () => void;
  onTriggerImageUpload: () => void;
  onClearActiveLayer: () => void;
  onAddLayer: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenSketchToImage: () => void;
  onOpenImageEdit: () => void;
  onOpenShortcuts: () => void;
  activeRightTab: "layers" | "ai";
  onSelectRightTab: (tab: "layers" | "ai") => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  projectName,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  isSaved,
  onOpenExport,
  onOpenNewCanvas,
  onOpenGallery,
  onTriggerImageUpload,
  onClearActiveLayer,
  onAddLayer,
  onFitToScreen,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  onOpenSketchToImage,
  onOpenImageEdit,
  onOpenShortcuts,
  activeRightTab,
  onSelectRightTab,
}) => {
  const [openMenu, setOpenMenu] = useState<"file" | "edit" | "view" | "ai" | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(projectName);
  }, [projectName]);

  // Click outside listener to close dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFinishRename = () => {
    if (titleInput.trim()) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      id="top-navbar"
      className="flex items-center justify-between px-3 h-12 bg-[#181818] border-b border-[#262626] select-none text-xs z-30 shrink-0"
    >
      {/* Left: Brand + Menus */}
      <div ref={menuContainerRef} className="flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#2A2A2A]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C5CFF] to-[#A88BFF] flex items-center justify-center text-white shadow-md shadow-[#7C5CFF]/30 font-bold text-xs">
            🎨
          </div>
          <span className="font-bold text-white text-xs tracking-tight hidden sm:inline">
            AI DRAWING STUDIO
          </span>
        </div>

        {/* Dropdown Menu Buttons */}
        <div className="flex items-center gap-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "file" ? null : "file")}
              className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${
                openMenu === "file" ? "bg-neutral-800 text-white" : ""
              }`}
            >
              File
            </button>
            {openMenu === "file" && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 text-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenNewCanvas();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <FilePlus className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>New Canvas...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenGallery();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>Open Projects Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onTriggerImageUpload();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>Import / Upload Image...</span>
                </button>
                <div className="my-1 border-t border-neutral-800" />
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onSave();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    <span>Save Project</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Ctrl+S</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenExport();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    <span>Export Artwork...</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Ctrl+E</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")}
              className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${
                openMenu === "edit" ? "bg-neutral-800 text-white" : ""
              }`}
            >
              Edit
            </button>
            {openMenu === "edit" && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 text-neutral-200">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={() => {
                    setOpenMenu(null);
                    onUndo();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Ctrl+Z</span>
                </button>
                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={() => {
                    setOpenMenu(null);
                    onRedo();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    <Redo2 className="w-3.5 h-3.5" />
                    <span>Redo</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Ctrl+Shift+Z</span>
                </button>
                <div className="my-1 border-t border-neutral-800" />
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onAddLayer();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Add New Layer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onClearActiveLayer();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950 text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Active Layer</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}
              className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${
                openMenu === "view" ? "bg-neutral-800 text-white" : ""
              }`}
            >
              View
            </button>
            {openMenu === "view" && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-neutral-900 border border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 text-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onFitToScreen();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fit to Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onResetZoom();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <span>Reset Zoom (100%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onZoomIn();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onZoomOut();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span>Zoom Out</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "ai" ? null : "ai")}
              className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 ${
                openMenu === "ai" ? "bg-neutral-800 text-white" : ""
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#7C5CFF]" />
              <span>AI</span>
            </button>
            {openMenu === "ai" && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-900 border border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 text-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onSelectRightTab("ai");
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>Open AI Assist Panel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenSketchToImage();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>Turn Sketch into Image...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenImageEdit();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Image Edit...</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Name (Editable) */}
        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-[#2A2A2A]">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishRename();
                if (e.key === "Escape") {
                  setTitleInput(projectName);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-neutral-900 border border-[#7C5CFF] rounded px-2 py-0.5 text-xs text-white outline-none w-44"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-neutral-300 hover:text-white font-medium hover:bg-neutral-800/80 px-2 py-0.5 rounded truncate max-w-[180px]"
              title="Click to rename artwork"
            >
              {projectName}
            </button>
          )}

          {/* Saved indicator */}
          <span
            className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded ${
              isSaved ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {isSaved ? <Check className="w-3 h-3" /> : "•"}
            <span>{isSaved ? "Saved" : "Edited"}</span>
          </span>
        </div>
      </div>

      {/* Right: Quick Action Buttons & Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddLayer}
          title="Add New Layer (Shift+N)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/80 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span className="hidden md:inline">+ Layer</span>
        </button>

        <button
          type="button"
          onClick={onOpenGallery}
          title="Open Projects Gallery"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/80 transition-colors"
        >
          <FolderKanban className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span className="hidden sm:inline">Gallery</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          title="Save Artwork (Ctrl+S)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/80 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          title="Export Artwork (Ctrl+E)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C5CFF] hover:bg-[#6847FF] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts & Help"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
