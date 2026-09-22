import React from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
}) => {
  return (
    <div
      id="canvas-controls"
      className="absolute bottom-4 left-4 z-20 flex items-center bg-[#1A1A1A]/90 backdrop-blur border border-neutral-700/80 rounded-lg p-1 shadow-lg text-xs text-neutral-300 select-none gap-1"
    >
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        className="p-1.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        title="Reset Zoom to 100%"
        className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-200 font-mono text-[11px] font-medium"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        className="p-1.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-700 mx-0.5" />

      <button
        type="button"
        onClick={onFitToScreen}
        title="Fit Canvas to Screen"
        className="p-1.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        title="Reset Pan and Zoom"
        className="p-1.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
