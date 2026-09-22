import React from "react";
import {
  MousePointer,
  Paintbrush,
  Pencil,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle,
  PaintBucket,
  Pipette,
  Hand,
  Trash2,
  Undo2,
  Redo2,
  Layers,
} from "lucide-react";
import { Tool } from "../../types/canvas";
import { ToolButton } from "./ToolButton";

interface MainToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearActiveLayer?: () => void;
  currentColor?: string;
  onOpenColorPicker?: () => void;
  onAddLayer?: () => void;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  currentTool,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearActiveLayer,
  currentColor,
  onOpenColorPicker,
  onAddLayer,
}) => {
  return (
    <aside
      id="main-toolbar"
      aria-label="Drawing Tools"
      className="flex flex-col items-center py-2.5 px-2 bg-[#181818] border-r border-[#262626] select-none z-20 shrink-0 w-14 gap-1"
    >
      <div className="flex flex-col gap-1 items-center w-full">
        <ToolButton
          id="tool-select"
          icon={MousePointer}
          label="Select & Move"
          shortcut="V"
          active={currentTool === "select"}
          onClick={() => onSelectTool("select")}
        />

        <ToolButton
          id="tool-brush"
          icon={Paintbrush}
          label="Brush"
          shortcut="B"
          active={currentTool === "brush"}
          onClick={() => onSelectTool("brush")}
        />

        <ToolButton
          id="tool-pencil"
          icon={Pencil}
          label="Pencil"
          shortcut="P"
          active={currentTool === "pencil"}
          onClick={() => onSelectTool("pencil")}
        />

        <ToolButton
          id="tool-marker"
          icon={Highlighter}
          label="Marker"
          shortcut="M"
          active={currentTool === "marker"}
          onClick={() => onSelectTool("marker")}
        />

        <ToolButton
          id="tool-eraser"
          icon={Eraser}
          label="Eraser"
          shortcut="E"
          active={currentTool === "eraser"}
          onClick={() => onSelectTool("eraser")}
        />

        <div className="w-8 h-[1px] bg-[#2A2A2A] my-1" />

        <ToolButton
          id="tool-line"
          icon={Minus}
          label="Line Tool"
          shortcut="L"
          active={currentTool === "line"}
          onClick={() => onSelectTool("line")}
        />

        <ToolButton
          id="tool-rectangle"
          icon={Square}
          label="Rectangle"
          shortcut="R"
          active={currentTool === "rectangle"}
          onClick={() => onSelectTool("rectangle")}
        />

        <ToolButton
          id="tool-circle"
          icon={Circle}
          label="Circle"
          shortcut="C"
          active={currentTool === "circle"}
          onClick={() => onSelectTool("circle")}
        />

        <ToolButton
          id="tool-fill"
          icon={PaintBucket}
          label="Paint Bucket"
          shortcut="G"
          active={currentTool === "fill"}
          onClick={() => onSelectTool("fill")}
        />

        <div className="w-8 h-[1px] bg-[#2A2A2A] my-1" />

        <ToolButton
          id="tool-eyedropper"
          icon={Pipette}
          label="Eyedropper"
          shortcut="I"
          active={currentTool === "eyedropper"}
          onClick={() => onSelectTool("eyedropper")}
        />

        <ToolButton
          id="tool-hand"
          icon={Hand}
          label="Hand / Pan"
          shortcut="H"
          active={currentTool === "hand"}
          onClick={() => onSelectTool("hand")}
        />
      </div>

      <div className="mt-auto flex flex-col gap-1 items-center w-full pt-2 border-t border-[#262626]">
        {currentColor && onOpenColorPicker && (
          <button
            id="tool-color-swatch"
            type="button"
            onClick={onOpenColorPicker}
            title={`Active Color: ${currentColor}`}
            className="w-8 h-8 rounded-lg border-2 border-neutral-600 shadow-md mb-1.5 transition-transform hover:scale-110 active:scale-95 ring-1 ring-black/40"
            style={{ backgroundColor: currentColor }}
          />
        )}

        <button
          id="action-undo"
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          id="action-redo"
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {onAddLayer && (
          <button
            id="action-add-layer"
            type="button"
            onClick={onAddLayer}
            title="Add New Layer (Shift+N)"
            aria-label="Add new layer"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-[#A88BFF] hover:bg-[#7C5CFF]/20 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        <button
          id="action-clear-layer"
          type="button"
          onClick={onClearActiveLayer}
          title="Clear Active Layer"
          aria-label="Clear active layer"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
