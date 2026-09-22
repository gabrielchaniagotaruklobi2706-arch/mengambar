export type Tool =
  | "select"
  | "brush"
  | "pencil"
  | "marker"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "fill"
  | "eyedropper"
  | "hand";

export interface BrushSettings {
  size: number;
  opacity: number; // 0 - 1
  hardness: number; // 0 - 1
  flow?: number; // 0 - 1
  smoothing?: number; // 0 - 1
  color: string;
}

export interface ViewportTransform {
  zoom: number; // e.g. 1.0 = 100%
  panX: number;
  panY: number;
  rotation?: number;
}

export type CanvasBackground = "white" | "offwhite" | "dark" | "transparent";

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}
