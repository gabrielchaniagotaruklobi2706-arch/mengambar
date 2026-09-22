import React, { useState } from "react";
import { Plus, X, Monitor, Square, Smartphone, Palette } from "lucide-react";
import { CanvasBackground } from "../../types/canvas";

interface NewCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number, background: CanvasBackground) => void;
}

const PRESETS = [
  { name: "Square (1:1)", width: 1080, height: 1080, icon: Square, desc: "Instagram, Icons, Avatars" },
  { name: "Full HD (16:9)", width: 1920, height: 1080, icon: Monitor, desc: "Desktop, Wallpaper, Landscape" },
  { name: "Story / Mobile (9:16)", width: 1080, height: 1920, icon: Smartphone, desc: "TikTok, Reels, Phone" },
  { name: "Compact Canvas", width: 800, height: 800, icon: Palette, desc: "Quick sketches, Pixel art" },
];

export const NewCanvasModal: React.FC<NewCanvasModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("Untitled Artwork");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [background, setBackground] = useState<CanvasBackground>("white");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWidth = Math.max(100, Math.min(4096, width));
    const finalHeight = Math.max(100, Math.min(4096, height));
    onCreate(name.trim() || "Untitled Artwork", finalWidth, finalHeight, background);
    onClose();
  };

  return (
    <div
      id="new-canvas-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-lg bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#7C5CFF]" />
            <h2 className="text-sm font-bold text-white">Create New Canvas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-canvas-name" className="font-medium text-neutral-200">
              Project Name
            </label>
            <input
              id="new-canvas-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 text-white outline-none focus:border-[#7C5CFF]"
            />
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Preset Dimensions</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = width === preset.width && height === preset.height;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setWidth(preset.width);
                      setHeight(preset.height);
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-[#221F3A] border-[#7C5CFF] text-white ring-1 ring-[#7C5CFF]"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-[#7C5CFF]" />
                    <div>
                      <div className="font-medium text-xs text-white">{preset.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {preset.width} × {preset.height} px
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Width & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="custom-width" className="font-medium text-neutral-200">
                Width (px)
              </label>
              <input
                id="custom-width"
                type="number"
                min="100"
                max="4096"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 font-mono text-white outline-none focus:border-[#7C5CFF]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="custom-height" className="font-medium text-neutral-200">
                Height (px)
              </label>
              <input
                id="custom-height"
                type="number"
                min="100"
                max="4096"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 font-mono text-white outline-none focus:border-[#7C5CFF]"
              />
            </div>
          </div>

          {/* Background color */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Canvas Background</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "white", label: "White", bg: "bg-white text-neutral-900" },
                { id: "offwhite", label: "Off-White", bg: "bg-[#F8F9FA] text-neutral-900" },
                { id: "dark", label: "Dark", bg: "bg-[#1E1E1E] text-white" },
                { id: "transparent", label: "Transparent", bg: "bg-neutral-800 text-neutral-200" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBackground(b.id as CanvasBackground)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all ${
                    background === b.id
                      ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 font-medium"
                      : "border-neutral-700/70"
                  } ${b.bg}`}
                >
                  <span className="text-[11px] block">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#7C5CFF] hover:bg-[#6847FF] text-white text-xs font-semibold shadow-md shadow-[#7C5CFF]/25"
            >
              Create Canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
