import React, { useState } from "react";
import { Eye, EyeOff, MoreVertical, Copy, Trash2, ArrowUp, ArrowDown, Edit2 } from "lucide-react";
import { Layer } from "../../types/layer";

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onChangeOpacity: (opacity: number) => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  canMoveUp,
  canMoveDown,
  onSelect,
  onToggleVisible,
  onChangeOpacity,
  onRename,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(layer.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleFinishRename = () => {
    if (nameVal.trim()) {
      onRename(nameVal.trim());
    } else {
      setNameVal(layer.name);
    }
    setIsEditingName(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col p-2.5 rounded-lg border transition-all cursor-pointer select-none text-xs ${
        isActive
          ? "bg-[#221F3A] border-[#7C5CFF] shadow-sm shadow-[#7C5CFF]/10 text-white"
          : "bg-[#1E1E1E] border-[#2A2A2A] hover:bg-[#252525] text-neutral-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisible();
          }}
          className={`p-1 rounded hover:bg-neutral-700/60 transition-colors ${
            layer.visible ? "text-neutral-300" : "text-neutral-600"
          }`}
          title={layer.visible ? "Hide layer" : "Show layer"}
        >
          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Layer Name / Edit input */}
        <div className="flex-1 truncate" onDoubleClick={() => setIsEditingName(true)}>
          {isEditingName ? (
            <input
              type="text"
              value={nameVal}
              autoFocus
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishRename();
                if (e.key === "Escape") {
                  setNameVal(layer.name);
                  setIsEditingName(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-neutral-900 border border-[#7C5CFF] rounded px-1.5 py-0.5 text-xs text-white outline-none"
            />
          ) : (
            <span className="font-medium truncate block">{layer.name}</span>
          )}
        </div>

        {/* Quick action buttons & menu */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            title="Move layer up"
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            title="Move layer down"
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-400"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-32 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 z-30 text-xs text-neutral-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditingName(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950 text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opacity slider inside active layer */}
      {isActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2"
        >
          <span className="text-[10px] text-neutral-400">Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={layer.opacity}
            onChange={(e) => onChangeOpacity(Number(e.target.value))}
            className="w-24 accent-[#7C5CFF] h-1 bg-neutral-700 rounded cursor-pointer"
          />
          <span className="text-[10px] font-mono text-neutral-300 w-8 text-right">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
