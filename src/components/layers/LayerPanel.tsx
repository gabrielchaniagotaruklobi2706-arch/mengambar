import React from "react";
import { Plus, Layers, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Layer } from "../../types/layer";
import { LayerItem } from "./LayerItem";

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onRenameLayer: (id: string, name: string) => void;
  onReorderLayer: (id: string, direction: "up" | "down") => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onToggleVisible,
  onChangeOpacity,
  onRenameLayer,
  onReorderLayer,
}) => {
  // Layers are stacked top to bottom in UI (index length - 1 down to 0)
  const displayLayers = [...layers].reverse();

  return (
    <div id="layer-panel" className="flex flex-col h-full bg-[#181818] select-none text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#262626]">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Layers className="w-4 h-4 text-[#7C5CFF]" />
          <span>Layers</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
            {layers.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddLayer}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#7C5CFF] hover:bg-[#6847FF] text-white rounded-md font-medium text-xs shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Layer</span>
        </button>
      </div>

      {/* Layers Stack */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
        {displayLayers.map((layer, index) => {
          const originalIndex = layers.findIndex((l) => l.id === layer.id);
          const canMoveUp = originalIndex < layers.length - 1;
          const canMoveDown = originalIndex > 0;

          return (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onSelect={() => onSelectLayer(layer.id)}
              onToggleVisible={() => onToggleVisible(layer.id)}
              onChangeOpacity={(op) => onChangeOpacity(layer.id, op)}
              onRename={(name) => onRenameLayer(layer.id, name)}
              onDuplicate={() => onDuplicateLayer(layer.id)}
              onDelete={() => onDeleteLayer(layer.id)}
              onMoveUp={() => onReorderLayer(layer.id, "up")}
              onMoveDown={() => onReorderLayer(layer.id, "down")}
            />
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-2 border-t border-[#262626] bg-[#141414] text-[11px] text-neutral-400 flex items-center justify-between">
        <span>Active: <strong className="text-neutral-200">{layers.find((l) => l.id === activeLayerId)?.name}</strong></span>
        <span>Blend: Normal</span>
      </div>
    </div>
  );
};
