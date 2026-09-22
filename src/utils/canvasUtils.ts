import { BrushSettings, CanvasBackground, Point, Tool } from "../types/canvas";
import { Layer } from "../types/layer";
import { hexToRgb, rgbToHex } from "./colorUtils";

export function createLayerCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
  return canvas;
}

export function drawInterpolatedStroke(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  tool: Tool,
  settings: BrushSettings
) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const step = Math.max(1, settings.size * 0.2);
  const steps = Math.max(1, Math.ceil(dist / step));

  ctx.save();

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  } else if (tool === "marker") {
    ctx.globalCompositeOperation = "source-over";
    const rgb = hexToRgb(settings.color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(0.4, settings.opacity * 0.5)})`;
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(0.4, settings.opacity * 0.5)})`;
  } else if (tool === "pencil") {
    ctx.globalCompositeOperation = "source-over";
    const rgb = hexToRgb(settings.color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
  } else {
    // Standard brush
    ctx.globalCompositeOperation = "source-over";
    const rgb = hexToRgb(settings.color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
  }

  // Adjust size by pressure if available
  const p1 = from.pressure !== undefined && from.pressure > 0 ? from.pressure : 1;
  const p2 = to.pressure !== undefined && to.pressure > 0 ? to.pressure : 1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const p = p1 + (p2 - p1) * t;

    let radius = (settings.size * (tool === "pencil" ? 0.6 : 1) * p) / 2;
    if (radius < 0.5) radius = 0.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: "line" | "rectangle" | "circle",
  start: Point,
  end: Point,
  settings: BrushSettings,
  isFillOnly = false,
  shiftKey = false
) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  const rgb = hexToRgb(settings.color);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
  ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
  ctx.lineWidth = Math.max(1, settings.size);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let endX = end.x;
  let endY = end.y;

  if (tool === "line") {
    if (shiftKey) {
      const dx = endX - start.x;
      const dy = endY - start.y;
      const angle = Math.atan2(dy, dx);
      // Snap to nearest 45 degrees (PI / 4)
      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const length = Math.hypot(dx, dy);
      endX = start.x + Math.cos(snapAngle) * length;
      endY = start.y + Math.sin(snapAngle) * length;
    }
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (tool === "rectangle") {
    let width = endX - start.x;
    let height = endY - start.y;
    if (shiftKey) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }
    const x = width < 0 ? start.x + width : start.x;
    const y = height < 0 ? start.y + height : start.y;
    const w = Math.abs(width);
    const h = Math.abs(height);

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    if (isFillOnly) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  } else if (tool === "circle") {
    let rx = Math.abs(endX - start.x) / 2;
    let ry = Math.abs(endY - start.y) / 2;
    if (shiftKey) {
      const r = Math.max(rx, ry);
      rx = r;
      ry = r;
    }
    const cx = (start.x + endX) / 2;
    const cy = (start.y + endY) / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
    if (isFillOnly) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  ctx.restore();
}

// Performant Breadth-First Flood Fill on Layer ImageData
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance = 32
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const intX = Math.floor(startX);
  const intY = Math.floor(startY);

  if (intX < 0 || intX >= width || intY < 0 || intY >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const targetIdx = (intY * width + intX) * 4;
  const targetR = data[targetIdx];
  const targetG = data[targetIdx + 1];
  const targetB = data[targetIdx + 2];
  const targetA = data[targetIdx + 3];

  const fillRgb = hexToRgb(fillColorHex);
  const fillR = fillRgb.r;
  const fillG = fillRgb.g;
  const fillB = fillRgb.b;
  const fillA = 255;

  // If already matches
  if (
    Math.abs(targetR - fillR) <= 2 &&
    Math.abs(targetG - fillG) <= 2 &&
    Math.abs(targetB - fillB) <= 2 &&
    Math.abs(targetA - fillA) <= 2
  ) {
    return;
  }

  function matchesTarget(idx: number): boolean {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    return (
      Math.abs(r - targetR) <= tolerance &&
      Math.abs(g - targetG) <= tolerance &&
      Math.abs(b - targetB) <= tolerance &&
      Math.abs(a - targetA) <= tolerance
    );
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueHead = 0;
  let queueTail = 0;

  const startPixel = intY * width + intX;
  queue[queueTail++] = startPixel;
  visited[startPixel] = 1;

  while (queueHead < queueTail) {
    const pixel = queue[queueHead++];
    const px = pixel % width;
    const py = Math.floor(pixel / width);
    const idx = pixel * 4;

    data[idx] = fillR;
    data[idx + 1] = fillG;
    data[idx + 2] = fillB;
    data[idx + 3] = fillA;

    // 4-neighborhood
    const neighbors = [
      px > 0 ? pixel - 1 : -1,
      px < width - 1 ? pixel + 1 : -1,
      py > 0 ? pixel - width : -1,
      py < height - 1 ? pixel + width : -1,
    ];

    for (let i = 0; i < 4; i++) {
      const n = neighbors[i];
      if (n !== -1 && !visited[n] && matchesTarget(n * 4)) {
        visited[n] = 1;
        queue[queueTail++] = n;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// Composite visible layers onto a merged canvas
export function compositeLayers(
  layers: Layer[],
  width: number,
  height: number,
  background: CanvasBackground = "white",
  scale = 1
): HTMLCanvasElement {
  const merged = document.createElement("canvas");
  merged.width = Math.floor(width * scale);
  merged.height = Math.floor(height * scale);
  const ctx = merged.getContext("2d");
  if (!ctx) return merged;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Draw background if not transparent
  if (background === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  } else if (background === "offwhite") {
    ctx.fillStyle = "#F8F9FA";
    ctx.fillRect(0, 0, width, height);
  } else if (background === "dark") {
    ctx.fillStyle = "#1E1E1E";
    ctx.fillRect(0, 0, width, height);
  }

  // Draw layers bottom to top
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (layer.visible && layer.opacity > 0) {
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.canvas, 0, 0, width, height);
      ctx.restore();
    }
  }

  return merged;
}

export function createLayer(
  width: number,
  height: number,
  name: string = "Layer"
): Layer {
  const canvas = createLayerCanvas(width, height);
  return {
    id: "layer_" + Math.random().toString(36).substring(2, 9),
    name,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    canvas,
  };
}

export function cloneLayer(source: Layer, newName?: string): Layer {
  const clonedCanvas = createLayerCanvas(source.canvas.width, source.canvas.height);
  const ctx = clonedCanvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(source.canvas, 0, 0);
  }
  return {
    id: "layer_" + Math.random().toString(36).substring(2, 9),
    name: newName || `${source.name} Copy`,
    visible: source.visible,
    opacity: source.opacity,
    blendMode: source.blendMode,
    canvas: clonedCanvas,
  };
}

export function renderImageOntoCanvas(
  canvas: HTMLCanvasElement,
  imageUrl: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      resolve();
    };
    img.onerror = (e) => reject(new Error("Failed to load image onto canvas"));
    img.src = imageUrl;
  });
}

export function compositeLayersToDataUrl(
  layers: Layer[],
  width: number,
  height: number,
  targetWidth?: number,
  targetHeight?: number
): string {
  const tw = targetWidth || width;
  const th = targetHeight || height;
  const scale = tw / width;
  const merged = compositeLayers(layers, width, height, "white", scale);
  return merged.toDataURL("image/png");
}

export function sampleCanvasColor(
  layers: Layer[],
  x: number,
  y: number,
  width: number,
  height: number,
  background: CanvasBackground
): string {
  const temp = compositeLayers(layers, width, height, background);
  const ctx = temp.getContext("2d");
  if (!ctx) return "#000000";
  const intX = Math.floor(x);
  const intY = Math.floor(y);
  if (intX < 0 || intX >= width || intY < 0 || intY >= height) return "#000000";
  const pixel = ctx.getImageData(intX, intY, 1, 1).data;
  return rgbToHex(pixel[0], pixel[1], pixel[2]);
}
