import React from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "B", action: "Brush Tool" },
  { key: "P", action: "Pencil Tool" },
  { key: "M", action: "Marker Tool" },
  { key: "E", action: "Eraser Tool" },
  { key: "L", action: "Line Tool (Hold Shift to snap 45°)" },
  { key: "R", action: "Rectangle Tool (Hold Shift for Square)" },
  { key: "C / O", action: "Circle Tool (Hold Shift for true Circle)" },
  { key: "G", action: "Paint Bucket / Flood Fill" },
  { key: "I", action: "Eyedropper (Sample color from canvas)" },
  { key: "H", action: "Hand / Pan Tool" },
  { key: "V", action: "Select & Move Tool" },
  { key: "[ / ]", action: "Decrease / Increase Brush Size" },
  { key: "Space + Drag", action: "Pan Canvas across Viewport" },
  { key: "Mouse Wheel", action: "Pan Canvas (Ctrl/Cmd + Wheel to Zoom)" },
  { key: "Ctrl + Z", action: "Undo Stroke / Action" },
  { key: "Ctrl + Shift + Z / Ctrl + Y", action: "Redo Stroke / Action" },
  { key: "Ctrl + S", action: "Save Project to Local Storage" },
  { key: "Ctrl + E", action: "Export Artwork Dialog" },
  { key: "Shift + N", action: "Add New Layer" },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="shortcuts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-lg bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#7C5CFF]" />
            <h2 className="text-sm font-bold text-white">Keyboard Shortcuts & Gestures</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto flex flex-col gap-2 text-xs">
          <div className="grid grid-cols-1 gap-1.5">
            {SHORTCUTS.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80"
              >
                <span className="text-neutral-300">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[#A88BFF] font-mono text-[11px] font-semibold shadow-inner">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
            <strong className="text-white">Touch & Stylus Support:</strong> Use one finger or stylus to draw, and two fingers to pinch-zoom and pan smoothly around the canvas.
          </div>
        </div>
      </div>
    </div>
  );
};
