export type AIStyle =
  | "Realistic"
  | "Anime"
  | "Cartoon"
  | "Watercolor"
  | "Oil Painting"
  | "Pencil Sketch"
  | "Digital Art"
  | "Pixel Art"
  | "3D Render"
  | "Comic"
  | "Cyberpunk"
  | "Fantasy"
  | "Minimalist"
  | "Custom";

export type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  style: AIStyle | string;
  aspectRatio: AspectRatio;
  referenceImage?: string; // base64
}

export interface SketchRequest {
  sketchDataUrl: string;
  prompt: string;
  style: AIStyle | string;
  aspectRatio: AspectRatio;
}

export interface EditImageRequest {
  imageDataUrl: string;
  instruction: string;
  style?: AIStyle | string;
}

export interface AIResult {
  imageUrl: string;
  caption?: string;
  prompt: string;
  style: string;
  provider: "gemini" | "smart-local";
  timestamp: number;
}
