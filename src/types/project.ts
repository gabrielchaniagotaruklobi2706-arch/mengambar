import { LayerSerialized } from "./layer";
import { CanvasBackground } from "./canvas";

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  background: CanvasBackground;
  layers: LayerSerialized[];
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnail: string;
  updatedAt: number;
  layerCount: number;
}
