export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0 - 1
  canvas: HTMLCanvasElement; // Working offscreen / memory canvas
  dataUrl?: string; // Serialized image string for saving/cloning
  blendMode?: BlendMode;
}

export interface LayerSerialized {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  dataUrl: string;
  blendMode?: BlendMode;
}

export type BlendMode = "normal" | "source-over" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
