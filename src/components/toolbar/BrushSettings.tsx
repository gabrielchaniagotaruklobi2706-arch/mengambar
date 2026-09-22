import React from "react";
import { BrushSettings as IBrushSettings, Tool } from "../../types/canvas";

interface BrushSettingsProps {
  tool: Tool;
  settings: IBrushSettings;
  onChange: (updated: Partial<IBrushSettings>) => void;
}

const PRESET_SIZES = [1, 2, 5, 10, 20, 40, 80];

export const BrushSettings: React.FC<BrushSettingsProps> = ({
  tool,
  settings,
  onChange,
}) => {
  const isEraser = tool === "eraser";
  const isBrushLike = ["brush", "pencil", "marker", "eraser", "line", "rectangle", "circle"].includes(tool);

  if (!isBrushLike) {
    return (
      <div className="flex items-center gap-3 text-xs text-neutral-400 py-1 px-3">
        <span>Tool: <strong className="text-white capitalize">{tool}</strong></span>
      </div>
    );
  }

  return (
    <div
      id="brush-settings-bar"
      className="flex items-center gap-4 flex-wrap text-xs text-neutral-300 select-none"
    >
      {/* Tool Label */}
      <div className="flex items-center gap-1.5 font-medium text-white capitalize bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/50">
        <span>{tool}</span>
      </div>

      {/* Brush Size Controls */}
      <div className="flex items-center gap-2">
        <label htmlFor="brush-size-slider" className="text-neutral-400">
          Size
        </label>
        <input
          id="brush-size-slider"
          type="range"
          min="1"
          max="120"
          value={settings.size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-20 md:w-28 accent-[#7C5CFF] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
        />
        <span className="w-8 font-mono text-neutral-200 text-right">{settings.size}px</span>

        {/* Quick size presets */}
        <div className="hidden lg:flex items-center gap-1 ml-1">
          {PRESET_SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => onChange({ size: sz })}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-colors ${
                settings.size === sz
                  ? "bg-[#7C5CFF] text-white"
                  : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity Control */}
      {!isEraser && (
        <div className="flex items-center gap-2">
          <label htmlFor="brush-opacity-slider" className="text-neutral-400">
            Opacity
          </label>
          <input
            id="brush-opacity-slider"
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={settings.opacity}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-16 md:w-20 accent-[#7C5CFF] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
          />
          <span className="w-9 font-mono text-neutral-200 text-right">
            {Math.round(settings.opacity * 100)}%
          </span>
        </div>
      )}

      {/* Brush Tip Preview */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700/60">
        <span className="text-neutral-400 text-[11px]">Tip:</span>
        <div className="w-7 h-7 flex items-center justify-center bg-neutral-900 border border-neutral-700/60 rounded">
          <div
            className="rounded-full transition-all"
            style={{
              width: `${Math.min(22, Math.max(2, settings.size))}px`,
              height: `${Math.min(22, Math.max(2, settings.size))}px`,
              backgroundColor: isEraser ? "#FFFFFF" : settings.color,
              opacity: settings.opacity,
            }}
          />
        </div>
      </div>
    </div>
  );
};
