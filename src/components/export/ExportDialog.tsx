import React, { useState } from "react";
import { Download, X, Image as ImageIcon } from "lucide-react";
import { CanvasBackground } from "../../types/canvas";
import { Layer } from "../../types/layer";
import { downloadDataUrl, exportArtwork } from "../../utils/fileUtils";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  width: number;
  height: number;
  background: CanvasBackground;
  projectName: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  layers,
  width,
  height,
  background,
  projectName,
}) => {
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState(1.0);
  const [scale, setScale] = useState(1);
  const [includeBg, setIncludeBg] = useState(true);

  if (!isOpen) return null;

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const handleExport = () => {
    const dataUrl = exportArtwork(layers, width, height, {
      format,
      quality,
      scale,
      includeBackground: includeBg,
      background,
    });

    const safeName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const filename = `${safeName}_${targetWidth}x${targetHeight}.${format}`;
    downloadDataUrl(dataUrl, filename);
    onClose();
  };

  return (
    <div
      id="export-dialog-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-md bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#7C5CFF]" />
            <h2 className="text-sm font-bold text-white">Export Artwork</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Format selection */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Image Format</span>
            <div className="grid grid-cols-3 gap-2">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-lg border font-mono uppercase text-center transition-all ${
                    format === fmt
                      ? "bg-[#7C5CFF] border-[#7C5CFF] text-white font-semibold"
                      : "bg-neutral-900 border-neutral-700/80 text-neutral-400 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale / Resolution */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Resolution Scale</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "0.5× (Half)", val: 0.5 },
                { label: "1× (Original)", val: 1 },
                { label: "2× (Ultra)", val: 2 },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setScale(s.val)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    scale === s.val
                      ? "bg-[#221F3A] border-[#7C5CFF] text-white ring-1 ring-[#7C5CFF]"
                      : "bg-neutral-900 border-neutral-700/80 text-neutral-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Output Dimensions: {targetWidth} × {targetHeight} px
            </div>
          </div>

          {/* Quality slider for JPEG / WEBP */}
          {format !== "png" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Compression Quality</span>
                <span className="font-mono text-neutral-300">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="accent-[#7C5CFF] h-1.5 bg-neutral-700 rounded cursor-pointer"
              />
            </div>
          )}

          {/* Include Background toggle */}
          {format === "png" && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeBg}
                onChange={(e) => setIncludeBg(e.target.checked)}
                className="accent-[#7C5CFF] w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-neutral-300">
                Include canvas background (uncheck for transparent PNG)
              </span>
            </label>
          )}

          {/* Export button */}
          <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 rounded-lg bg-[#7C5CFF] hover:bg-[#6847FF] text-white text-xs font-semibold shadow-md shadow-[#7C5CFF]/25 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
