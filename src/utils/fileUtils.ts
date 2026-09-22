import { CanvasBackground } from "../types/canvas";
import { Layer } from "../types/layer";
import { compositeLayers } from "./canvasUtils";

export interface ExportOptions {
  format: "png" | "jpeg" | "webp";
  quality: number; // 0.1 - 1.0
  scale: number; // 0.5, 1, 2
  includeBackground: boolean;
  background: CanvasBackground;
  filename?: string;
}

export function exportArtwork(
  layers: Layer[],
  width: number,
  height: number,
  options: ExportOptions
): string {
  const bgToUse = options.includeBackground ? options.background : "transparent";
  const merged = compositeLayers(layers, width, height, bgToUse, options.scale);

  let mimeType = "image/png";
  if (options.format === "jpeg") mimeType = "image/jpeg";
  if (options.format === "webp") mimeType = "image/webp";

  return merged.toDataURL(mimeType, options.quality);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function generateThumbnail(
  layers: Layer[],
  width: number,
  height: number,
  background: CanvasBackground,
  maxSize = 280
): string {
  const scale = Math.min(maxSize / width, maxSize / height, 1);
  const thumbCanvas = compositeLayers(layers, width, height, background, scale);
  return thumbCanvas.toDataURL("image/webp", 0.75);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      reject(new Error("Please upload a PNG, JPG, or WEBP image."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = dataUrl;
  });
}
