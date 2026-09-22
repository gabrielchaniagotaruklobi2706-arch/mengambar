import React, { useState, useEffect } from "react";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "../../utils/colorUtils";
import { Pipette, X } from "lucide-react";

interface ColorPickerProps {
  color?: string;
  currentColor?: string;
  onChange?: (hex: string) => void;
  onChangeColor?: (hex: string) => void;
  recentColors: string[];
  onPickEyedropper?: () => void;
  onClose?: () => void;
}

const DEFAULT_PALETTE = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#78350F", // Brown
  "#6B7280", // Gray
  "#14B8A6", // Teal
  "#A855F7", // Indigo/Violet
  "#F43F5E", // Rose
  "#64748B", // Slate
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  currentColor,
  onChange,
  onChangeColor,
  recentColors,
  onPickEyedropper,
  onClose,
}) => {
  const activeColor = color || currentColor || "#7C5CFF";
  const emitChange = (hex: string) => {
    onChange?.(hex);
    onChangeColor?.(hex);
  };

  const [hexInput, setHexInput] = useState(activeColor.toUpperCase());
  const [mode, setMode] = useState<"HEX" | "RGB" | "HSL">("HEX");

  const rgb = hexToRgb(activeColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  useEffect(() => {
    setHexInput(activeColor.toUpperCase());
  }, [activeColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      emitChange(val);
    }
  };

  const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
    const clamped = Math.max(0, Math.min(255, val || 0));
    const newRgb = { ...rgb, [channel]: clamped };
    emitChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (channel: "h" | "s" | "l", val: number) => {
    const max = channel === "h" ? 360 : 100;
    const clamped = Math.max(0, Math.min(max, val || 0));
    const newHsl = { ...hsl, [channel]: clamped };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    emitChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="absolute left-16 bottom-12 z-40 flex flex-col gap-3 p-3.5 bg-[#181818] rounded-xl border border-neutral-700 shadow-2xl select-none text-xs text-neutral-300 w-full max-w-[280px]">
      {/* Current Color & Eyedropper row */}
      <div className="flex items-center gap-3">
        <div className="relative group shrink-0">
          <label
            htmlFor="native-color-input"
            className="block w-10 h-10 rounded-lg cursor-pointer border border-neutral-600 shadow-inner"
            style={{ backgroundColor: activeColor }}
            title="Click to open system color picker"
          />
          <input
            id="native-color-input"
            type="color"
            value={activeColor.startsWith("#") && activeColor.length === 7 ? activeColor : "#000000"}
            onChange={(e) => emitChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200">Color System</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1 text-[10px]">
                {(["HEX", "RGB", "HSL"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      mode === m ? "bg-[#7C5CFF] text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Form input based on mode */}
          {mode === "HEX" && (
            <div className="flex items-center gap-1.5">
              <input
                id="hex-color-input"
                type="text"
                maxLength={7}
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#000000"
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-2 py-1 font-mono text-white text-xs outline-none focus:border-[#7C5CFF]"
              />
              {onPickEyedropper && (
                <button
                  type="button"
                  onClick={onPickEyedropper}
                  title="Pick color from canvas"
                  className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  <Pipette className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {mode === "RGB" && (
            <div className="grid grid-cols-3 gap-1">
              {(["r", "g", "b"] as const).map((ch) => (
                <div key={ch} className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 uppercase">{ch}</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[ch]}
                    onChange={(e) => handleRgbChange(ch, Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1 py-0.5 font-mono text-white text-xs outline-none focus:border-[#7C5CFF]"
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "HSL" && (
            <div className="grid grid-cols-3 gap-1">
              {(["h", "s", "l"] as const).map((ch) => (
                <div key={ch} className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 uppercase">
                    {ch === "h" ? "Hue" : ch === "s" ? "Sat%" : "Lit%"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={ch === "h" ? 360 : 100}
                    value={hsl[ch]}
                    onChange={(e) => handleHslChange(ch, Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1 py-0.5 font-mono text-white text-xs outline-none focus:border-[#7C5CFF]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preset Swatches Palette */}
      <div>
        <div className="text-[10px] text-neutral-400 font-semibold mb-1.5 uppercase tracking-wider">
          Presets
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {DEFAULT_PALETTE.map((palColor) => (
            <button
              key={palColor}
              type="button"
              onClick={() => emitChange(palColor)}
              title={palColor}
              className={`w-6 h-6 rounded border transition-all hover:scale-110 active:scale-95 ${
                activeColor.toLowerCase() === palColor.toLowerCase()
                  ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/40 scale-105"
                  : "border-neutral-700"
              }`}
              style={{ backgroundColor: palColor }}
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="pt-2 border-t border-neutral-800">
          <div className="text-[10px] text-neutral-400 font-semibold mb-1.5 uppercase tracking-wider">
            Recent Colors
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
            {recentColors.map((recColor, idx) => (
              <button
                key={`${recColor}-${idx}`}
                type="button"
                onClick={() => emitChange(recColor)}
                title={recColor}
                className={`w-5 h-5 rounded border transition-all hover:scale-110 active:scale-95 ${
                  activeColor.toLowerCase() === recColor.toLowerCase()
                    ? "border-[#7C5CFF] ring-1 ring-[#7C5CFF]"
                    : "border-neutral-700"
                }`}
                style={{ backgroundColor: recColor }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
