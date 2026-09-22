import React, { useState } from "react";
import { Download, Layers, Sparkles, X, RefreshCw, Maximize2, SplitSquareVertical } from "lucide-react";
import { AIResult } from "../../types/ai";
import { downloadDataUrl } from "../../utils/fileUtils";

interface AIResultModalProps {
  result: AIResult | null;
  sketchUrl?: string | null;
  onClose: () => void;
  onUseAsCanvas: (imageUrl: string) => void;
  onInsertAsLayer: (imageUrl: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export const AIResultModal: React.FC<AIResultModalProps> = ({
  result,
  sketchUrl,
  onClose,
  onUseAsCanvas,
  onInsertAsLayer,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);

  if (!result) return null;

  const handleDownload = () => {
    const filename = `artwork_${result.style.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.png`;
    downloadDataUrl(result.imageUrl, filename);
  };

  return (
    <div
      id="ai-result-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#7C5CFF]/20 text-[#A88BFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Generated Artwork</h2>
              <p className="text-[11px] text-neutral-400">
                Style: <span className="text-[#7C5CFF] font-medium">{result.style}</span> • Provider:{" "}
                <span className="capitalize">{result.provider}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sketchUrl && (
              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  showComparison
                    ? "bg-[#7C5CFF] border-[#7C5CFF] text-white"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white"
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>{showComparison ? "Show AI Only" : "Compare with Sketch"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body / Image Preview */}
        <div className="flex-1 overflow-auto p-5 flex flex-col items-center justify-center bg-[#0F0F0F]">
          <div className="relative max-h-[55vh] max-w-full rounded-xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
            {showComparison && sketchUrl ? (
              <div className="relative select-none overflow-hidden max-h-[55vh]">
                <img
                  src={result.imageUrl}
                  alt="AI Result"
                  referrerPolicy="no-referrer"
                  className="max-h-[55vh] w-auto object-contain block"
                />
                {/* Sketch overlay clipped by compare split */}
                <div
                  className="absolute inset-0 overflow-hidden border-r-2 border-[#7C5CFF]"
                  style={{ width: `${compareSplit}%` }}
                >
                  <img
                    src={sketchUrl}
                    alt="Original Sketch"
                    referrerPolicy="no-referrer"
                    className="max-h-[55vh] w-auto object-contain"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-white">
                    Original Sketch
                  </span>
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#7C5CFF]/80 text-[10px] text-white">
                  AI Output
                </span>

                {/* Slider bar */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compareSplit}
                  onChange={(e) => setCompareSplit(Number(e.target.value))}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 accent-[#7C5CFF] opacity-75 hover:opacity-100 transition-opacity"
                />
              </div>
            ) : (
              <img
                src={result.imageUrl}
                alt={result.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] w-auto object-contain rounded-lg"
              />
            )}
          </div>

          {/* Prompt caption */}
          <div className="mt-3 text-center max-w-xl">
            <p className="text-xs text-neutral-300 italic">"{result.prompt}"</p>
            {result.caption && (
              <p className="text-[11px] text-neutral-400 mt-1">{result.caption}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#262626] bg-[#141414] gap-3 flex-wrap">
          <button
            type="button"
            disabled={isRegenerating}
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onInsertAsLayer(result.imageUrl);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Insert as Layer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onUseAsCanvas(result.imageUrl);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C5CFF] hover:bg-[#6A47FF] text-white text-xs font-semibold shadow-md shadow-[#7C5CFF]/25 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Use as Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
