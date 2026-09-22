import React, { useState, useEffect, useRef, useCallback } from "react";
import { TopNavbar } from "./components/topbar/TopNavbar";
import { MainToolbar } from "./components/toolbar/MainToolbar";
import { StatusBar } from "./components/bottombar/StatusBar";
import { CanvasViewport } from "./components/canvas/CanvasViewport";
import { LayerPanel } from "./components/layers/LayerPanel";
import { AIPanel } from "./components/ai/AIPanel";
import { ColorPicker } from "./components/color/ColorPicker";
import { NewCanvasModal } from "./components/project/NewCanvasModal";
import { ProjectGallery } from "./components/project/ProjectGallery";
import { ExportDialog } from "./components/export/ExportDialog";
import { AIResultModal } from "./components/ai/AIResultModal";
import { SketchToImageModal } from "./components/ai/SketchToImageModal";
import { ImageEditModal } from "./components/ai/ImageEditModal";
import { ShortcutsModal } from "./components/modals/ShortcutsModal";

import { Tool, BrushSettings, CanvasBackground, Point, ViewportTransform } from "./types/canvas";
import { Layer } from "./types/layer";
import { Project, ProjectSummary } from "./types/project";
import { AIResult, AIStyle, AspectRatio } from "./types/ai";

import {
  createLayer,
  cloneLayer,
  compositeLayersToDataUrl,
  renderImageOntoCanvas,
} from "./utils/canvasUtils";
import {
  saveProjectToStorage,
  getProjectFromStorage,
  getAllProjectSummaries,
  deleteProjectFromStorage,
} from "./services/storage/indexedDB";
import {
  generateArtworkAI,
  sketchToImageAI,
  editImageAI,
  checkAIHealth,
} from "./services/ai/aiService";
import { readFileAsDataUrl, exportArtwork, downloadDataUrl } from "./utils/fileUtils";

import { Sparkles, Layers as LayersIcon, ChevronRight, ChevronLeft } from "lucide-react";

interface HistorySnapshot {
  layers: {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    imageData: ImageData;
  }[];
  activeLayerId: string;
}

export default function App() {
  // --- Project State ---
  const [projectId, setProjectId] = useState<string>(() => "proj_" + Date.now());
  const [projectName, setProjectName] = useState<string>("Masterpiece Sketch");
  const [canvasWidth, setCanvasWidth] = useState<number>(1080);
  const [canvasHeight, setCanvasHeight] = useState<number>(1080);
  const [canvasBackground, setCanvasBackground] = useState<CanvasBackground>("white");
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // --- Layer Management ---
  const [layers, setLayers] = useState<Layer[]>(() => {
    const bgLayer = createLayer(1080, 1080, "Background");
    const sketchLayer = createLayer(1080, 1080, "Layer 1 (Sketch)");
    const paintLayer = createLayer(1080, 1080, "Layer 2 (Paint & Detail)");
    return [bgLayer, sketchLayer, paintLayer];
  });
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[2]?.id || layers[1]?.id || layers[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // --- Tools & Brushes ---
  const [currentTool, setCurrentTool] = useState<Tool>("brush");
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    color: "#7C5CFF",
    size: 14,
    opacity: 1,
    hardness: 0.8,
    smoothing: 0.5,
  });
  const [recentColors, setRecentColors] = useState<string[]>([
    "#7C5CFF",
    "#000000",
    "#FFFFFF",
    "#EF4444",
    "#10B981",
    "#3B82F6",
    "#F59E0B",
  ]);

  // --- Viewport State ---
  const [viewportTransform, setViewportTransform] = useState<ViewportTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [cursorPoint, setCursorPoint] = useState<Point | null>(null);

  // --- History (Undo / Redo) ---
  const historyRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [historyVersion, setHistoryVersion] = useState(0); // Triggers re-evaluation of canUndo / canRedo

  // --- Right Panel Tab & Collapse ---
  const [rightPanelTab, setRightPanelTab] = useState<"layers" | "ai">("layers");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // --- Modals State ---
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isNewCanvasModalOpen, setIsNewCanvasModalOpen] = useState(false);
  const [isProjectGalleryOpen, setIsProjectGalleryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSketchToImageOpen, setIsSketchToImageOpen] = useState(false);
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);

  // --- AI Workflow State ---
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [sketchSnapshotUrl, setSketchSnapshotUrl] = useState<string | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [lastAIOptions, setLastAIOptions] = useState<any>(null);

  // --- Projects List ---
  const [savedProjects, setSavedProjects] = useState<ProjectSummary[]>([]);

  // Hidden file input for uploading images
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend AI Health
  useEffect(() => {
    checkAIHealth().then((res) => {
      setHasApiKey(res.hasApiKey);
    });
    refreshProjectGallery();
  }, []);

  const refreshProjectGallery = async () => {
    const list = await getAllProjectSummaries();
    setSavedProjects(list);
  };

  // Push new state to History Stack
  const pushHistorySnapshot = useCallback(() => {
    const snapshot: HistorySnapshot = {
      activeLayerId,
      layers: layers.map((layer) => {
        const ctx = layer.canvas.getContext("2d");
        const imageData = ctx
          ? ctx.getImageData(0, 0, canvasWidth, canvasHeight)
          : new ImageData(canvasWidth, canvasHeight);
        return {
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          imageData,
        };
      }),
    };

    // Slice away any redo states if we were back in time
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);

    // Limit history stack size to 40
    if (newHistory.length > 40) {
      newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistoryVersion((v) => v + 1);
    setIsSaved(false);
  }, [layers, activeLayerId, canvasWidth, canvasHeight]);

  // Initial history snapshot on load
  useEffect(() => {
    if (historyRef.current.length === 0) {
      pushHistorySnapshot();
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIndex = historyIndexRef.current - 1;
    const snapshot = historyRef.current[targetIndex];
    if (!snapshot) return;

    // Restore layers
    const restoredLayers: Layer[] = snapshot.layers.map((item) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.putImageData(item.imageData, 0, 0);
      return {
        id: item.id,
        name: item.name,
        visible: item.visible,
        opacity: item.opacity,
        blendMode: "normal",
        canvas,
      };
    });

    historyIndexRef.current = targetIndex;
    setLayers(restoredLayers);
    setActiveLayerId(snapshot.activeLayerId);
    setHistoryVersion((v) => v + 1);
    setIsSaved(false);
  }, [canUndo, canvasWidth, canvasHeight]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIndex = historyIndexRef.current + 1;
    const snapshot = historyRef.current[targetIndex];
    if (!snapshot) return;

    const restoredLayers: Layer[] = snapshot.layers.map((item) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.putImageData(item.imageData, 0, 0);
      return {
        id: item.id,
        name: item.name,
        visible: item.visible,
        opacity: item.opacity,
        blendMode: "normal",
        canvas,
      };
    });

    historyIndexRef.current = targetIndex;
    setLayers(restoredLayers);
    setActiveLayerId(snapshot.activeLayerId);
    setHistoryVersion((v) => v + 1);
    setIsSaved(false);
  }, [canRedo, canvasWidth, canvasHeight]);

  // When a drawing stroke finishes
  const handleCommitCanvasChange = useCallback(
    (layerId: string) => {
      pushHistorySnapshot();
    },
    [pushHistorySnapshot]
  );

  // Update Color & track Recents
  const handleSelectColor = (hex: string) => {
    setBrushSettings((prev) => ({ ...prev, color: hex }));
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== hex.toLowerCase());
      return [hex, ...filtered].slice(0, 14);
    });
  };

  // Color Eyedropper sampled
  const handleSampleColor = (hex: string) => {
    handleSelectColor(hex);
    // Switch back to previous drawing tool or brush
    setCurrentTool("brush");
  };

  // --- Layer Operations ---
  const handleAddLayer = (customName?: string) => {
    const layerName = customName || `Layer ${layers.length + 1}`;
    const newLayer = createLayer(canvasWidth, canvasHeight, layerName);
    const activeIndex = layers.findIndex((l) => l.id === activeLayerId);
    const updated = [...layers];
    if (activeIndex >= 0) {
      updated.splice(activeIndex + 1, 0, newLayer);
    } else {
      updated.push(newLayer);
    }
    setLayers(updated);
    setActiveLayerId(newLayer.id);
    setRightPanelTab("layers");
    setIsRightPanelOpen(true);
    showToast(`Layer added: "${layerName}"`);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) {
      showToast("Canvas must have at least one layer");
      return;
    }
    const target = layers.find((l) => l.id === id);
    const updated = layers.filter((l) => l.id !== id);
    setLayers(updated);
    if (activeLayerId === id) {
      setActiveLayerId(updated[updated.length - 1].id);
    }
    showToast(`Layer removed: "${target?.name || "Layer"}"`);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleDuplicateLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const duplicated = cloneLayer(target, `${target.name} Copy`);
    const targetIndex = layers.findIndex((l) => l.id === id);
    const updated = [...layers];
    updated.splice(targetIndex + 1, 0, duplicated);
    setLayers(updated);
    setActiveLayerId(duplicated.id);
    setRightPanelTab("layers");
    setIsRightPanelOpen(true);
    showToast(`Layer duplicated: "${duplicated.name}"`);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleToggleLayerVisible = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleChangeLayerOpacity = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  };

  const handleRenameLayer = (id: string, name: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name } : l))
    );
  };

  const handleReorderLayer = (id: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const updated = [...layers];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setLayers(updated);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleClearActiveLayer = () => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active) return;
    const ctx = active.canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      pushHistorySnapshot();
    }
  };

  // --- Project Saving & Loading ---
  const handleSaveProject = async () => {
    const thumbnail = compositeLayersToDataUrl(layers, canvasWidth, canvasHeight, 280, 280);
    const projectData: Project = {
      id: projectId,
      name: projectName,
      width: canvasWidth,
      height: canvasHeight,
      background: canvasBackground,
      layers: layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        dataUrl: layer.canvas.toDataURL("image/png"),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnail,
    };

    await saveProjectToStorage(projectData);
    setIsSaved(true);
    await refreshProjectGallery();
  };

  const handleCreateNewCanvas = (
    name: string,
    width: number,
    height: number,
    background: CanvasBackground
  ) => {
    const newId = "proj_" + Date.now();
    const bgLayer = createLayer(width, height, "Background");
    const paintLayer = createLayer(width, height, "Layer 1");

    setProjectId(newId);
    setProjectName(name);
    setCanvasWidth(width);
    setCanvasHeight(height);
    setCanvasBackground(background);
    setLayers([bgLayer, paintLayer]);
    setActiveLayerId(paintLayer.id);

    // Reset history
    historyRef.current = [];
    historyIndexRef.current = -1;
    setViewportTransform({ zoom: 1, panX: 0, panY: 0 });

    setTimeout(() => {
      pushHistorySnapshot();
      setIsSaved(true);
    }, 20);
  };

  const handleOpenProject = async (id: string) => {
    const project = await getProjectFromStorage(id);
    if (!project) return;

    // Reconstruct layer canvases
    const loadedLayers: Layer[] = [];
    for (const savedLayer of project.layers) {
      const canvas = document.createElement("canvas");
      canvas.width = project.width;
      canvas.height = project.height;
      if (savedLayer.dataUrl) {
        await renderImageOntoCanvas(canvas, savedLayer.dataUrl);
      }
      loadedLayers.push({
        id: savedLayer.id,
        name: savedLayer.name,
        visible: savedLayer.visible,
        opacity: savedLayer.opacity,
        blendMode: savedLayer.blendMode,
        canvas,
      });
    }

    setProjectId(project.id);
    setProjectName(project.name);
    setCanvasWidth(project.width);
    setCanvasHeight(project.height);
    setCanvasBackground(project.background || "white");
    setLayers(loadedLayers);
    setActiveLayerId(loadedLayers[loadedLayers.length - 1]?.id || loadedLayers[0].id);

    historyRef.current = [];
    historyIndexRef.current = -1;
    setViewportTransform({ zoom: 1, panX: 0, panY: 0 });

    setTimeout(() => {
      pushHistorySnapshot();
      setIsSaved(true);
    }, 20);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await deleteProjectFromStorage(id);
    await refreshProjectGallery();
  };

  const handleDuplicateProject = async (id: string) => {
    const orig = await getProjectFromStorage(id);
    if (!orig) return;
    const duplicated: Project = {
      ...orig,
      id: "proj_" + Date.now(),
      name: `${orig.name} Copy`,
      updatedAt: Date.now(),
    };
    await saveProjectToStorage(duplicated);
    await refreshProjectGallery();
  };

  const handleRenameProjectInGallery = async (id: string, newName: string) => {
    const orig = await getProjectFromStorage(id);
    if (!orig) return;
    orig.name = newName;
    orig.updatedAt = Date.now();
    await saveProjectToStorage(orig);
    await refreshProjectGallery();
    if (id === projectId) {
      setProjectName(newName);
    }
  };

  const handleExportProjectFromGallery = async (id: string) => {
    const proj = await getProjectFromStorage(id);
    if (!proj) return;
    // Export thumbnail or composited
    if (proj.thumbnail) {
      downloadDataUrl(proj.thumbnail, `${proj.name.replace(/\s+/g, "_")}.png`);
    }
  };

  // --- Image Upload / Import ---
  const handleImportImage = async (dataUrl: string) => {
    const layer = createLayer(canvasWidth, canvasHeight, "Imported Image");
    await renderImageOntoCanvas(layer.canvas, dataUrl);
    setLayers((prev) => [...prev, layer]);
    setActiveLayerId(layer.id);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await handleImportImage(dataUrl);
    } catch (err: any) {
      alert(err.message || "Failed to import image");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and drop image import onto window
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "copy";
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          await handleImportImage(dataUrl);
        } catch (err: any) {
          alert("Error loading dropped image: " + err.message);
        }
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [canvasWidth, canvasHeight]);

  // --- AI Operations ---
  const handleAIGenerate = async (data: {
    prompt: string;
    negativePrompt?: string;
    style: AIStyle | string;
    aspectRatio: AspectRatio;
    referenceImage?: string;
  }) => {
    setIsAIGenerating(true);
    setLastAIOptions({ type: "generate", data });
    setSketchSnapshotUrl(null);
    try {
      const res = await generateArtworkAI(data);
      setAiResult(res);
    } catch (err: any) {
      alert("AI generation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleOpenSketchToImageModal = () => {
    const snapshot = compositeLayersToDataUrl(layers, canvasWidth, canvasHeight);
    setSketchSnapshotUrl(snapshot);
    setIsSketchToImageOpen(true);
  };

  const handleAISketchToImage = async (data: {
    prompt: string;
    style: AIStyle | string;
    aspectRatio: AspectRatio;
  }) => {
    setIsAIGenerating(true);
    setIsSketchToImageOpen(false);
    setLastAIOptions({ type: "sketch", data });
    try {
      const snapshot = sketchSnapshotUrl || compositeLayersToDataUrl(layers, canvasWidth, canvasHeight);
      const res = await sketchToImageAI({
        sketchDataUrl: snapshot,
        prompt: data.prompt,
        style: data.style,
        aspectRatio: data.aspectRatio,
      });
      setAiResult(res);
    } catch (err: any) {
      alert("Sketch transform failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleOpenImageEditModal = () => {
    const snapshot = compositeLayersToDataUrl(layers, canvasWidth, canvasHeight);
    setSketchSnapshotUrl(snapshot);
    setIsImageEditOpen(true);
  };

  const handleAIEditImage = async (data: { instruction: string; style?: AIStyle | string }) => {
    setIsAIGenerating(true);
    setIsImageEditOpen(false);
    setLastAIOptions({ type: "edit", data });
    try {
      const snapshot = sketchSnapshotUrl || compositeLayersToDataUrl(layers, canvasWidth, canvasHeight);
      const res = await editImageAI({
        imageDataUrl: snapshot,
        instruction: data.instruction,
        style: data.style,
      });
      setAiResult(res);
    } catch (err: any) {
      alert("AI Image Edit failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleRegenerateAI = () => {
    if (!lastAIOptions) return;
    if (lastAIOptions.type === "generate") {
      handleAIGenerate(lastAIOptions.data);
    } else if (lastAIOptions.type === "sketch") {
      handleAISketchToImage(lastAIOptions.data);
    } else if (lastAIOptions.type === "edit") {
      handleAIEditImage(lastAIOptions.data);
    }
  };

  const handleInsertAIResultAsLayer = async (imageUrl: string) => {
    const newLayer = createLayer(canvasWidth, canvasHeight, `AI ${aiResult?.style || "Art"}`);
    await renderImageOntoCanvas(newLayer.canvas, imageUrl);
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  const handleUseAIResultAsCanvas = async (imageUrl: string) => {
    // Clear and paint on active layer or new base layer
    const newLayer = createLayer(canvasWidth, canvasHeight, "AI Canvas Base");
    await renderImageOntoCanvas(newLayer.canvas, imageUrl);
    setLayers([newLayer]);
    setActiveLayerId(newLayer.id);
    setTimeout(() => pushHistorySnapshot(), 10);
  };

  // --- Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      // Export: Ctrl/Cmd + E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsExportDialogOpen(true);
        return;
      }

      // Add Layer: Shift + N or Ctrl/Cmd + Shift + N
      if (
        (e.key.toLowerCase() === "n" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n")
      ) {
        e.preventDefault();
        handleAddLayer();
        return;
      }

      // Tools Shortcuts
      switch (e.key.toLowerCase()) {
        case "b":
          setCurrentTool("brush");
          break;
        case "p":
          setCurrentTool("pencil");
          break;
        case "m":
          setCurrentTool("marker");
          break;
        case "e":
          setCurrentTool("eraser");
          break;
        case "l":
          setCurrentTool("line");
          break;
        case "r":
          setCurrentTool("rectangle");
          break;
        case "c":
        case "o":
          setCurrentTool("circle");
          break;
        case "g":
          setCurrentTool("fill");
          break;
        case "i":
          setCurrentTool("eyedropper");
          break;
        case "h":
          setCurrentTool("hand");
          break;
        case "v":
          setCurrentTool("select");
          break;
        case "[":
          setBrushSettings((prev) => ({ ...prev, size: Math.max(1, prev.size - 2) }));
          break;
        case "]":
          setBrushSettings((prev) => ({ ...prev, size: Math.min(200, prev.size + 2) }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveProject]);

  return (
    <div id="ai-drawing-studio-app" className="flex flex-col h-screen w-screen bg-[#111111] overflow-hidden text-neutral-200 select-none">
      {/* Hidden File Input for Image Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <TopNavbar
        projectName={projectName}
        onRenameProject={setProjectName}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveProject}
        isSaved={isSaved}
        onOpenExport={() => setIsExportDialogOpen(true)}
        onOpenNewCanvas={() => setIsNewCanvasModalOpen(true)}
        onOpenGallery={() => setIsProjectGalleryOpen(true)}
        onTriggerImageUpload={() => fileInputRef.current?.click()}
        onClearActiveLayer={handleClearActiveLayer}
        onAddLayer={handleAddLayer}
        onFitToScreen={() => {
          setViewportTransform({ zoom: 1, panX: 0, panY: 0 });
        }}
        onResetZoom={() => {
          setViewportTransform((prev) => ({ ...prev, zoom: 1 }));
        }}
        onZoomIn={() => {
          setViewportTransform((prev) => ({
            ...prev,
            zoom: Math.min(8, Math.round((prev.zoom + 0.2) * 100) / 100),
          }));
        }}
        onZoomOut={() => {
          setViewportTransform((prev) => ({
            ...prev,
            zoom: Math.max(0.1, Math.round((prev.zoom - 0.2) * 100) / 100),
          }));
        }}
        onOpenSketchToImage={handleOpenSketchToImageModal}
        onOpenImageEdit={handleOpenImageEditModal}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeRightTab={rightPanelTab}
        onSelectRightTab={(tab) => {
          setRightPanelTab(tab);
          setIsRightPanelOpen(true);
        }}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            id="toast-notification"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/95 border border-[#7C5CFF] text-white text-xs font-medium rounded-full shadow-2xl flex items-center gap-2 backdrop-blur animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none"
          >
            <LayersIcon className="w-3.5 h-3.5 text-[#A88BFF]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Left Vertical Main Toolbar */}
        <MainToolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          currentColor={brushSettings.color}
          onOpenColorPicker={() => setIsColorPickerOpen(!isColorPickerOpen)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onAddLayer={handleAddLayer}
          onClearActiveLayer={handleClearActiveLayer}
        />

        {/* Color Picker Popover */}
        {isColorPickerOpen && (
          <ColorPicker
            currentColor={brushSettings.color}
            onChangeColor={handleSelectColor}
            onClose={() => setIsColorPickerOpen(false)}
            recentColors={recentColors}
          />
        )}

        {/* Center Canvas Viewport */}
        <CanvasViewport
          width={canvasWidth}
          height={canvasHeight}
          layers={layers}
          activeLayerId={activeLayerId}
          background={canvasBackground}
          currentTool={currentTool}
          brushSettings={brushSettings}
          onCommitChange={handleCommitCanvasChange}
          onSampleColor={handleSampleColor}
          onCursorCoordinatesChange={setCursorPoint}
          viewportTransform={viewportTransform}
          onTransformChange={setViewportTransform}
        />

        {/* Right Dock / Sidebar */}
        <div
          id="right-dock-sidebar"
          className={`relative flex flex-col border-l border-[#262626] bg-[#181818] transition-all duration-200 z-10 shrink-0 ${
            isRightPanelOpen ? "w-80" : "w-11"
          }`}
        >
          {/* Dock Header Tabs & Collapse */}
          <div className="flex items-center justify-between h-10 px-2 border-b border-[#262626] bg-[#161616]">
            {isRightPanelOpen ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRightPanelTab("layers")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    rightPanelTab === "layers"
                      ? "bg-[#252525] text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <LayersIcon className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>Layers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab("ai")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    rightPanelTab === "ai"
                      ? "bg-[#252525] text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span>AI Assist</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTab("layers");
                    setIsRightPanelOpen(true);
                  }}
                  title="Open Layers"
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <LayersIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTab("ai");
                    setIsRightPanelOpen(true);
                  }}
                  title="Open AI Assist"
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              title={isRightPanelOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              {isRightPanelOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Dock Content */}
          {isRightPanelOpen && (
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === "layers" ? (
                <LayerPanel
                  layers={layers}
                  activeLayerId={activeLayerId}
                  onSelectLayer={setActiveLayerId}
                  onAddLayer={handleAddLayer}
                  onDeleteLayer={handleDeleteLayer}
                  onDuplicateLayer={handleDuplicateLayer}
                  onToggleVisible={handleToggleLayerVisible}
                  onChangeOpacity={handleChangeLayerOpacity}
                  onRenameLayer={handleRenameLayer}
                  onReorderLayer={handleReorderLayer}
                />
              ) : (
                <AIPanel
                  onGenerate={handleAIGenerate}
                  onOpenSketchToImage={handleOpenSketchToImageModal}
                  onOpenImageEdit={handleOpenImageEditModal}
                  isGenerating={isAIGenerating}
                  hasApiKey={hasApiKey}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        currentTool={currentTool}
        brushSettings={brushSettings}
        onUpdateBrushSettings={(updated) =>
          setBrushSettings((prev) => ({ ...prev, ...updated }))
        }
        width={canvasWidth}
        height={canvasHeight}
        zoom={viewportTransform.zoom}
        cursorPoint={cursorPoint}
        background={canvasBackground}
        onChangeBackground={setCanvasBackground}
        onOpenColorPicker={() => setIsColorPickerOpen(!isColorPickerOpen)}
      />

      {/* --- Modals & Overlays --- */}

      {/* New Canvas Modal */}
      <NewCanvasModal
        isOpen={isNewCanvasModalOpen}
        onClose={() => setIsNewCanvasModalOpen(false)}
        onCreate={handleCreateNewCanvas}
      />

      {/* Project Gallery Modal */}
      <ProjectGallery
        isOpen={isProjectGalleryOpen}
        onClose={() => setIsProjectGalleryOpen(false)}
        projects={savedProjects}
        currentProjectId={projectId}
        onOpenProject={handleOpenProject}
        onCreateNew={() => {
          setIsProjectGalleryOpen(false);
          setIsNewCanvasModalOpen(true);
        }}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProjectInGallery}
        onExportProject={handleExportProjectFromGallery}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        layers={layers}
        width={canvasWidth}
        height={canvasHeight}
        background={canvasBackground}
        projectName={projectName}
      />

      {/* AI Generated Result Modal */}
      <AIResultModal
        result={aiResult}
        sketchUrl={sketchSnapshotUrl}
        onClose={() => setAiResult(null)}
        onUseAsCanvas={handleUseAIResultAsCanvas}
        onInsertAsLayer={handleInsertAIResultAsLayer}
        onRegenerate={handleRegenerateAI}
        isRegenerating={isAIGenerating}
      />

      {/* Sketch To Image Modal */}
      <SketchToImageModal
        isOpen={isSketchToImageOpen}
        onClose={() => setIsSketchToImageOpen(false)}
        sketchDataUrl={sketchSnapshotUrl || ""}
        onTransform={handleAISketchToImage}
        isProcessing={isAIGenerating}
      />

      {/* AI Image Edit Modal */}
      <ImageEditModal
        isOpen={isImageEditOpen}
        onClose={() => setIsImageEditOpen(false)}
        imageDataUrl={sketchSnapshotUrl || ""}
        onApplyEdit={handleAIEditImage}
        isProcessing={isAIGenerating}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
