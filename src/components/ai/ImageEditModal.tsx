import React, { useState } from "react";
import { Sliders, X, Sparkles, Loader2 } from "lucide-react";
import { AIStyle } from "../../types/ai";

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  onApplyEdit: (data: { instruction: string; style?: AIStyle | string }) => void;
  isProcessing: boolean;
}

const QUICK_INSTRUCTIONS = [
  "Make the sky more dramatic at sunset with warm golden clouds",
  "Add high snow-capped mountains in the distant background",
  "Convert this entire artwork into a vibrant watercolor painting",
  "Enhance lighting with cinematic volumetric sunbeams and glowing rim light",
  "Turn this scene into a neon cyberpunk nighttime city",
  "Add lush magical flowers and glowing fireflies around the scene",
];

export const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  onApplyEdit,
  isProcessing,
}) => {
  const [instruction, setInstruction] = useState("");
  const [style, setStyle] = useState("Default");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isProcessing) return;
    onApplyEdit({
      instruction: instruction.trim(),
      style: style !== "Default" ? style : undefined,
    });
  };

  return (
    <div
      id="image-edit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-xl bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Image Editing</h2>
              <p className="text-[11px] text-neutral-400">
                Provide natural language instructions to modify your artwork
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {/* Target image preview */}
          <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="w-20 h-20 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
              <img
                src={imageDataUrl}
                alt="Target for edit"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-white block">Selected Artwork</span>
              <span className="text-[11px] text-neutral-400">
                Instruction will be executed by Gemini Flash Image while preserving core elements.
              </span>
            </div>
          </div>

          {/* Instruction Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-instruction" className="font-medium text-neutral-200">
              Modification Instruction
            </label>
            <textarea
              id="edit-instruction"
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="E.g. Change the background to a dramatic sunset and add glowing mystical lights..."
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#7C5CFF] resize-none"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5">Quick Inspiration:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INSTRUCTIONS.map((qi, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(qi)}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-[10px] text-left transition-colors"
                >
                  {qi.length > 40 ? qi.slice(0, 40) + "..." : qi}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
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
              disabled={!instruction.trim() || isProcessing}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying AI Edit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply AI Edit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
