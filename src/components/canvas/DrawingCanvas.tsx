import React, { useRef, useEffect, useCallback } from "react";
import { BrushSettings, CanvasBackground, Point, Tool } from "../../types/canvas";
import { Layer } from "../../types/layer";
import {
  drawInterpolatedStroke,
  drawShape,
  floodFill,
  sampleCanvasColor,
} from "../../utils/canvasUtils";

interface DrawingCanvasProps {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  background: CanvasBackground;
  currentTool: Tool;
  brushSettings: BrushSettings;
  onCommitChange: (layerId: string) => void;
  onSampleColor: (hex: string) => void;
  onCursorMove?: (canvasPoint: Point | null) => void;
  isPanning: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  layers,
  activeLayerId,
  background,
  currentTool,
  brushSettings,
  onCommitChange,
  onSampleColor,
  onCursorMove,
  isPanning,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing state refs to avoid React re-renders during active stroke
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const startPointRef = useRef<Point | null>(null);
  const activeLayerRef = useRef<Layer | null>(null);

  // Keep active layer ref updated
  useEffect(() => {
    activeLayerRef.current = layers.find((l) => l.id === activeLayerId) || null;
  }, [layers, activeLayerId]);

  // Redraw the composited master display canvas
  const renderCompositedCanvas = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const ctx = displayCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
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
    // If transparent, it shows checkerboard pattern from CSS container

    // Composite all layers from bottom to top
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.visible && layer.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
        ctx.restore();
      }
    }
  }, [layers, width, height, background]);

  // Redraw when layers, dimensions, or background change
  useEffect(() => {
    renderCompositedCanvas();
  }, [renderCompositedCanvas]);

  // Convert client pointer coordinates to canvas pixel space
  const getCanvasCoordinates = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        pressure: e.pressure > 0 ? e.pressure : 1,
      };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning || currentTool === "hand" || currentTool === "select") return;

    // Eyedropper mode
    if (currentTool === "eyedropper") {
      const point = getCanvasCoordinates(e);
      const hex = sampleCanvasColor(layers, point.x, point.y, width, height, background);
      onSampleColor(hex);
      return;
    }

    const activeLayer = activeLayerRef.current;
    if (!activeLayer || !activeLayer.visible) return;

    const point = getCanvasCoordinates(e);

    // Flood fill tool executes immediately on click
    if (currentTool === "fill") {
      const layerCtx = activeLayer.canvas.getContext("2d", { willReadFrequently: true });
      if (layerCtx) {
        floodFill(layerCtx, point.x, point.y, brushSettings.color);
        renderCompositedCanvas();
        onCommitChange(activeLayer.id);
      }
      return;
    }

    // Capture pointer to continue drawing even outside canvas boundaries
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    isDrawingRef.current = true;
    startPointRef.current = point;
    lastPointRef.current = point;

    // For brush/pencil/marker/eraser, start drawing immediately
    if (["brush", "pencil", "marker", "eraser"].includes(currentTool)) {
      const layerCtx = activeLayer.canvas.getContext("2d");
      if (layerCtx) {
        drawInterpolatedStroke(layerCtx, point, point, currentTool, brushSettings);
        renderCompositedCanvas();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    onCursorMove?.(point);

    if (!isDrawingRef.current) return;
    const activeLayer = activeLayerRef.current;
    if (!activeLayer) return;

    if (["brush", "pencil", "marker", "eraser"].includes(currentTool)) {
      const layerCtx = activeLayer.canvas.getContext("2d");
      if (layerCtx && lastPointRef.current) {
        drawInterpolatedStroke(layerCtx, lastPointRef.current, point, currentTool, brushSettings);
        lastPointRef.current = point;
        renderCompositedCanvas();
      }
    } else if (["line", "rectangle", "circle"].includes(currentTool)) {
      // For shapes, render preview onto overlay canvas without touching layer until release
      const overlay = overlayCanvasRef.current;
      if (!overlay || !startPointRef.current) return;
      const ctx = overlay.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      drawShape(
        ctx,
        currentTool as "line" | "rectangle" | "circle",
        startPointRef.current,
        point,
        brushSettings,
        false,
        e.shiftKey
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    const activeLayer = activeLayerRef.current;
    if (!activeLayer) return;

    const point = getCanvasCoordinates(e);

    // If shape tool, commit from startPoint to endPoint onto activeLayer
    if (["line", "rectangle", "circle"].includes(currentTool) && startPointRef.current) {
      const layerCtx = activeLayer.canvas.getContext("2d");
      if (layerCtx) {
        drawShape(
          layerCtx,
          currentTool as "line" | "rectangle" | "circle",
          startPointRef.current,
          point,
          brushSettings,
          false,
          e.shiftKey
        );
      }
      // Clear overlay preview
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
      }
      renderCompositedCanvas();
    }

    startPointRef.current = null;
    lastPointRef.current = null;

    // Trigger history save
    onCommitChange(activeLayer.id);
  };

  const handlePointerLeave = () => {
    onCursorMove?.(null);
  };

  return (
    <div
      ref={containerRef}
      id="drawing-canvas-container"
      className="relative shadow-2xl transition-shadow select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Transparent Checkerboard Pattern */}
      {background === "transparent" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #2A2A2A 25%, transparent 25%), linear-gradient(-45deg, #2A2A2A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2A2A2A 75%), linear-gradient(-45deg, transparent 75%, #2A2A2A 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            backgroundColor: "#1C1C1C",
          }}
        />
      )}

      {/* Composited Display Canvas */}
      <canvas
        ref={displayCanvasRef}
        id="display-canvas"
        width={width}
        height={height}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />

      {/* Interactive Overlay Canvas for Pointer events and Shape previews */}
      <canvas
        ref={overlayCanvasRef}
        id="interaction-overlay-canvas"
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`absolute inset-0 block w-full h-full touch-none ${
          isPanning || currentTool === "hand"
            ? "cursor-grab active:cursor-grabbing"
            : currentTool === "eyedropper"
            ? "cursor-crosshair"
            : currentTool === "select"
            ? "cursor-default"
            : "cursor-crosshair"
        }`}
      />
    </div>
  );
};
