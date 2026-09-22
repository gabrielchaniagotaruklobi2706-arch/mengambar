import React, { useRef, useState, useEffect, useCallback } from "react";
import { BrushSettings, CanvasBackground, Point, Tool, ViewportTransform } from "../../types/canvas";
import { Layer } from "../../types/layer";
import { DrawingCanvas } from "./DrawingCanvas";
import { CanvasControls } from "./CanvasControls";

interface CanvasViewportProps {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  background: CanvasBackground;
  currentTool: Tool;
  brushSettings: BrushSettings;
  onCommitChange: (layerId: string) => void;
  onSampleColor: (hex: string) => void;
  onCursorCoordinatesChange?: (pt: Point | null) => void;
  onCurrentZoomChange?: (zoom: number) => void;
  viewportTransform: ViewportTransform;
  onTransformChange: (transform: ViewportTransform) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  width,
  height,
  layers,
  activeLayerId,
  background,
  currentTool,
  brushSettings,
  onCommitChange,
  onSampleColor,
  onCursorCoordinatesChange,
  onCurrentZoomChange,
  viewportTransform,
  onTransformChange,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMiddleMouseDown, setIsMiddleMouseDown] = useState(false);
  const [isPanningWithHand, setIsPanningWithHand] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ clientX: number; clientY: number } | null>(null);
  const [isCursorInsideCanvas, setIsCursorInsideCanvas] = useState(false);

  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  const isPanningActive =
    isSpacePressed ||
    isMiddleMouseDown ||
    isPanningWithHand ||
    currentTool === "hand";

  // Fit canvas to viewport screen
  const fitToScreen = useCallback(() => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const padding = 48;
    const availWidth = rect.width - padding * 2;
    const availHeight = rect.height - padding * 2;
    const scale = Math.min(availWidth / width, availHeight / height, 1);
    const roundedZoom = Math.round(scale * 100) / 100;

    onTransformChange({
      zoom: Math.max(0.1, roundedZoom),
      panX: 0,
      panY: 0,
    });
  }, [width, height, onTransformChange]);

  // Initial fit to screen on mount
  useEffect(() => {
    fitToScreen();
  }, [width, height]);

  // Sync zoom changes to parent
  useEffect(() => {
    onCurrentZoomChange?.(viewportTransform.zoom);
  }, [viewportTransform.zoom, onCurrentZoomChange]);

  // Keyboard Space listener for quick Hand/Pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Wheel zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!viewportRef.current) return;

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered at cursor
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.1, Math.min(8.0, viewportTransform.zoom * zoomFactor));

      onTransformChange({
        ...viewportTransform,
        zoom: Math.round(newZoom * 100) / 100,
      });
    } else {
      // Pan
      onTransformChange({
        ...viewportTransform,
        panX: viewportTransform.panX - e.deltaX,
        panY: viewportTransform.panY - e.deltaY,
      });
    }
  };

  // Viewport pointer down for panning
  const handleViewportPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || isSpacePressed || currentTool === "hand") {
      e.preventDefault();
      if (e.button === 1) setIsMiddleMouseDown(true);
      if (currentTool === "hand") setIsPanningWithHand(true);

      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: viewportTransform.panX,
        panY: viewportTransform.panY,
      };

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handleViewportPointerMove = (e: React.PointerEvent) => {
    setCursorPos({ clientX: e.clientX, clientY: e.clientY });

    if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      onTransformChange({
        ...viewportTransform,
        panX: panStartRef.current.panX + dx,
        panY: panStartRef.current.panY + dy,
      });
    }
  };

  const handleViewportPointerUp = (e: React.PointerEvent) => {
    if (panStartRef.current) {
      panStartRef.current = null;
      setIsMiddleMouseDown(false);
      setIsPanningWithHand(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Touch gesture support: Pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = viewportTransform.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = dist / touchStartDistRef.current;
      const newZoom = Math.max(0.1, Math.min(8.0, touchStartZoomRef.current * scale));

      onTransformChange({
        ...viewportTransform,
        zoom: Math.round(newZoom * 100) / 100,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  const showBrushCursor =
    isCursorInsideCanvas &&
    !isPanningActive &&
    ["brush", "pencil", "marker", "eraser"].includes(currentTool);

  const brushCursorRadius = Math.max(2, (brushSettings.size * viewportTransform.zoom) / 2);

  return (
    <div
      ref={viewportRef}
      id="canvas-viewport"
      onWheel={handleWheel}
      onPointerDown={handleViewportPointerDown}
      onPointerMove={handleViewportPointerMove}
      onPointerUp={handleViewportPointerUp}
      onPointerCancel={handleViewportPointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative flex-1 h-full w-full overflow-hidden bg-[#111111] flex items-center justify-center select-none ${
        isPanningActive ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Centered Canvas Canvas Container with Transform */}
      <div
        className="will-change-transform transition-none"
        style={{
          transform: `translate(${viewportTransform.panX}px, ${viewportTransform.panY}px) scale(${viewportTransform.zoom})`,
          transformOrigin: "center center",
        }}
        onMouseEnter={() => setIsCursorInsideCanvas(true)}
        onMouseLeave={() => {
          setIsCursorInsideCanvas(false);
          onCursorCoordinatesChange?.(null);
        }}
      >
        <DrawingCanvas
          width={width}
          height={height}
          layers={layers}
          activeLayerId={activeLayerId}
          background={background}
          currentTool={currentTool}
          brushSettings={brushSettings}
          onCommitChange={onCommitChange}
          onSampleColor={onSampleColor}
          onCursorMove={onCursorCoordinatesChange}
          isPanning={isPanningActive}
        />
      </div>

      {/* Floating Canvas Viewport Controls */}
      <CanvasControls
        zoom={viewportTransform.zoom}
        onZoomIn={() =>
          onTransformChange({
            ...viewportTransform,
            zoom: Math.min(8.0, Math.round((viewportTransform.zoom + 0.15) * 100) / 100),
          })
        }
        onZoomOut={() =>
          onTransformChange({
            ...viewportTransform,
            zoom: Math.max(0.1, Math.round((viewportTransform.zoom - 0.15) * 100) / 100),
          })
        }
        onFitToScreen={fitToScreen}
        onResetZoom={() =>
          onTransformChange({
            zoom: 1.0,
            panX: 0,
            panY: 0,
          })
        }
      />

      {/* Custom Brush Ring Cursor */}
      {showBrushCursor && cursorPos && (
        <div
          className="fixed pointer-events-none rounded-full border border-white/80 mix-blend-difference z-50 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${cursorPos.clientX}px`,
            top: `${cursorPos.clientY}px`,
            width: `${brushCursorRadius * 2}px`,
            height: `${brushCursorRadius * 2}px`,
          }}
        >
          <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};
