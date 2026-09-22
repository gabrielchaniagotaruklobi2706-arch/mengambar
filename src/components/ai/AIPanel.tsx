import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  Upload,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Info,
  Sliders,
} from "lucide-react";
import { AIStyle, AspectRatio } from "../../types/ai";
import { readFileAsDataUrl } from "../../utils/fileUtils";

interface AIPanelProps {
  onGenerate: (data: {
    prompt: string;
    negativePrompt?: string;
    style: AIStyle | string;
    aspectRatio: AspectRatio;
    referenceImage?: string;
  }) => void;
  onOpenSketchToImage: () => void;
  onOpenImageEdit: () => void;
  isGenerating: boolean;
  hasApiKey: boolean;
}

const AI_STYLES: AIStyle[] = [
  "Realistic",
  "Anime",
  "Cartoon",
  "Watercolor",
  "Oil Painting",
  "Pencil Sketch",
  "Digital Art",
  "Pixel Art",
  "3D Render",
  "Comic",
  "Cyberpunk",
  "Fantasy",
  "Minimalist",
  "Custom",
];

const ASPECT_RATIOS: { value: AspectRatio; label: string; iconSize: string }[] = [
  { value: "1:1", label: "1:1 Square", iconSize: "w-4 h-4" },
  { value: "4:3", label: "4:3 Standard", iconSize: "w-4 h-3" },
  { value: "3:4", label: "3:4 Portrait", iconSize: "w-3 h-4" },
  { value: "16:9", label: "16:9 Landscape", iconSize: "w-5 h-3" },
  { value: "9:16", label: "9:16 Story", iconSize: "w-3 h-5" },
];

export const AIPanel: React.FC<AIPanelProps> = ({
  onGenerate,
  onOpenSketchToImage,
  onOpenImageEdit,
  isGenerating,
  hasApiKey,
}) => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState<AIStyle | string>("Digital Art");
  const [customStyle, setCustomStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReferenceImage(dataUrl);
    } catch (err: any) {
      alert(err.message || "Failed to load reference image");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      style: style === "Custom" && customStyle.trim() ? customStyle.trim() : style,
      aspectRatio,
      referenceImage: referenceImage || undefined,
    });
  };

  return (
    <div id="ai-panel" className="flex flex-col h-full bg-[#181818] select-none text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#262626]">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
          <span>AI Assist</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#A88BFF] font-medium border border-[#7C5CFF]/30">
          Studio 3.1
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4">
        {/* Quick Assist Actions */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Canvas AI Tools
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenSketchToImage}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-[#7C5CFF]/40 text-white hover:border-[#7C5CFF] hover:bg-neutral-800 transition-all text-left shadow-sm"
            >
              <Wand2 className="w-4 h-4 text-[#7C5CFF] shrink-0" />
              <div>
                <div className="font-medium text-xs">Sketch to Art</div>
                <div className="text-[10px] text-neutral-400">Transform canvas</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenImageEdit}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-700/60 text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all text-left shadow-sm"
            >
              <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-xs">AI Image Edit</div>
                <div className="text-[10px] text-neutral-400">Modify with prompt</div>
              </div>
            </button>
          </div>
        </div>

        <div className="w-full h-[1px] bg-[#262626]" />

        {/* Text to Image Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Generate New Image
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ai-prompt-input" className="font-medium text-neutral-200">
              Prompt
            </label>
            <textarea
              id="ai-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city at sunset with flying cars, cinematic lighting, detailed environment..."
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#7C5CFF] transition-colors resize-none"
            />
          </div>

          {/* Style Selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ai-style-select" className="font-medium text-neutral-200">
              Style Preset
            </label>
            <select
              id="ai-style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg p-2 text-xs text-white outline-none focus:border-[#7C5CFF]"
            >
              {AI_STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {style === "Custom" && (
              <input
                type="text"
                placeholder="Enter custom artistic style..."
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#7C5CFF]"
              />
            )}
          </div>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Aspect Ratio</span>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-mono transition-all ${
                    aspectRatio === ar.value
                      ? "bg-[#7C5CFF] border-[#7C5CFF] text-white shadow-sm"
                      : "bg-neutral-900 border-neutral-700/70 text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <div className={`border border-current rounded-sm mb-1 ${ar.iconSize}`} />
                  <span>{ar.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference Image (Optional) */}
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-neutral-200">Reference Image (Optional)</span>
            {referenceImage ? (
              <div className="relative group rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 p-1">
                <img
                  src={referenceImage}
                  alt="Reference"
                  referrerPolicy="no-referrer"
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900/90 hover:bg-rose-900 text-rose-400 text-[10px] rounded border border-neutral-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="ref-image-upload"
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-900/50 hover:bg-neutral-900 cursor-pointer transition-colors text-neutral-400 hover:text-neutral-200"
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs">Upload reference image</span>
                <input
                  id="ref-image-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleReferenceUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <span>{showAdvanced ? "▼ Hide Advanced Options" : "▶ Advanced Options"}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 flex flex-col gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <label htmlFor="ai-neg-prompt" className="text-[11px] text-neutral-300">
                  Negative Prompt (Exclude)
                </label>
                <input
                  id="ai-neg-prompt"
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, distorted, low quality, artifacts"
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#7C5CFF]"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="ai-generate-button"
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7C5CFF] to-[#6038FF] hover:from-[#8B6EFE] hover:to-[#7049FF] text-white rounded-lg font-semibold text-xs shadow-md shadow-[#7C5CFF]/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Artwork...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Artwork</span>
              </>
            )}
          </button>
        </form>

        {/* Prototype status note */}
        <div className="mt-auto p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0 mt-0.5" />
          <span>
            Generates high-resolution images with Gemini Flash Image. If offline or unconfigured, local generative canvas preview is provided.
          </span>
        </div>
      </div>
    </div>
  );
};
