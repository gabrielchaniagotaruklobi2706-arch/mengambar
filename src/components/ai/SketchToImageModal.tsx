import React, { useState } from "react";
import { Wand2, X, Sparkles, Loader2 } from "lucide-react";
import { AIStyle, AspectRatio } from "../../types/ai";

interface SketchToImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sketchDataUrl: string;
  onTransform: (data: {
    prompt: string;
    style: AIStyle | string;
    aspectRatio: AspectRatio;
  }) => void;
  isProcessing: boolean;
}

const STYLES: AIStyle[] = [
  "Realistic",
  "Anime",
  "Fantasy",
  "Watercolor",
  "Oil Painting",
  "Digital Art",
  "Cyberpunk",
  "3D Render",
  "Comic",
  "Cartoon",
];

export const SketchToImageModal: React.FC<SketchToImageModalProps> = ({
  isOpen,
  onClose,
  sketchDataUrl,
  onTransform,
  isProcessing,
}) => {
  const [prompt, setPrompt] = useState(
    "Transform this hand-drawn sketch into a finished detailed illustration. Preserve the primary composition, shapes, and perspective."
  );
  const [style, setStyle] = useState<AIStyle | string>("Fantasy");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    onTransform({
      prompt: prompt.trim(),
      style,
      aspectRatio,
    });
  };

  return (
    <div
      id="sketch-to-image-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-xl bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#7C5CFF]/20 text-[#A88BFF]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Turn Sketch into Image</h2>
              <p className="text-[11px] text-neutral-400">
                AI will use your canvas drawing as the structural composition
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {/* Sketch Preview thumbnail */}
          <div className="flex items-center gap-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border border-neutral-700 shrink-0 flex items-center justify-center">
              <img
                src={sketchDataUrl}
                alt="Current Sketch"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-xs mb-1">Canvas Snapshot Captured</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                The AI model will analyze your stroke layout, shapes, and proportions, and re-render them with detailed lighting and textures.
              </p>
            </div>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sketch-prompt" className="font-medium text-neutral-200">
              Scene Description & Instructions
            </label>
            <textarea
              id="sketch-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Transform this sketch into a grand fantasy castle with waterfalls, glowing mystical trees, and dramatic sunset clouds..."
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#7C5CFF] resize-none"
            />
          </div>

          {/* Style & Aspect */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sketch-style" className="font-medium text-neutral-200">
                Target Art Style
              </label>
              <select
                id="sketch-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2 text-xs text-white outline-none focus:border-[#7C5CFF]"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sketch-aspect" className="font-medium text-neutral-200">
                Aspect Ratio
              </label>
              <select
                id="sketch-aspect"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2 text-xs text-white outline-none focus:border-[#7C5CFF]"
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="3:4">3:4 (Portrait)</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
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
              disabled={!prompt.trim() || isProcessing}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#633BFE] hover:from-[#8C6DFE] hover:to-[#734DFE] text-white text-xs font-semibold shadow-md shadow-[#7C5CFF]/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transforming Sketch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate from Sketch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
