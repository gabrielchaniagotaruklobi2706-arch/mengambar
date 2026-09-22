import React from "react";
import { Point, Tool, CanvasBackground } from "../../types/canvas";
import { BrushSettings } from "../toolbar/BrushSettings";
import { BrushSettings as IBrushSettings } from "../../types/canvas";

interface StatusBarProps {
  currentTool: Tool;
  brushSettings: IBrushSettings;
  onUpdateBrushSettings: (updated: Partial<IBrushSettings>) => void;
  width: number;
  height: number;
  zoom: number;
  cursorPoint: Point | null;
  background: CanvasBackground;
  onChangeBackground: (bg: CanvasBackground) => void;
  onOpenColorPicker: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentTool,
  brushSettings,
  onUpdateBrushSettings,
  width,
  height,
  zoom,
  cursorPoint,
  background,
  onChangeBackground,
  onOpenColorPicker,
}) => {
  return (
    <footer
      id="status-bar"
      className="flex items-center justify-between px-3 h-10 bg-[#181818] border-t border-[#262626] select-none text-xs text-neutral-300 z-20 shrink-0 gap-4 overflow-x-auto"
    >
      {/* Left: Active Brush & Settings Bar */}
      <div className="flex items-center gap-3 shrink-0">
        <BrushSettings
          tool={currentTool}
          settings={brushSettings}
          onChange={onUpdateBrushSettings}
        />

        {/* Quick Color Swatch Button */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700/60">
          <span className="text-[11px] text-neutral-400">Color:</span>
          <button
            type="button"
            onClick={onOpenColorPicker}
            title="Click to change color"
            className="w-5 h-5 rounded-md border border-neutral-600 shadow-sm transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: brushSettings.color }}
          />
          <span className="font-mono text-[11px] text-neutral-300">{brushSettings.color.toUpperCase()}</span>
        </div>
      </div>

      {/* Right: Canvas Info, Zoom, Coordinates */}
      <div className="flex items-center gap-4 shrink-0 text-[11px] text-neutral-400">
        {/* Background select */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span>Canvas:</span>
          <select
            value={background}
            onChange={(e) => onChangeBackground(e.target.value as CanvasBackground)}
            className="bg-neutral-900 border border-neutral-700/70 rounded px-1.5 py-0.5 text-[11px] text-neutral-200 outline-none"
          >
            <option value="white">White</option>
            <option value="offwhite">Off-White</option>
            <option value="dark">Dark</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="hidden md:inline font-mono">
          {width} × {height} px
        </div>

        {/* Coordinates */}
        <div className="w-24 font-mono text-right">
          {cursorPoint ? `${Math.round(cursorPoint.x)}, ${Math.round(cursorPoint.y)}` : "— , —"}
        </div>

        {/* Zoom */}
        <div className="font-mono text-neutral-200 bg-neutral-800 px-2 py-0.5 rounded">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </footer>
  );
};
