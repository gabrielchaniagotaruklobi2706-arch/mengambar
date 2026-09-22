import {
  AIResult,
  EditImageRequest,
  GenerateImageRequest,
  SketchRequest,
} from "../../types/ai";

export interface AIService {
  generateImage(request: GenerateImageRequest): Promise<AIResult>;
  sketchToImage(request: SketchRequest): Promise<AIResult>;
  editImage(request: EditImageRequest): Promise<AIResult>;
  checkHealth(): Promise<{ hasApiKey: boolean }>;
}

/**
 * Procedural artistic canvas generator used when GEMINI_API_KEY is not configured.
 * Clearly marks provider as "smart-local" so users know it's a prototype mockup.
 */
function createArtisticFallbackCanvas(
  prompt: string,
  style: string,
  aspectRatio: string,
  baseSketchUrl?: string
): Promise<string> {
  return new Promise((resolve) => {
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "3:4") {
      width = 768;
      height = 1024;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Select color mood based on style and prompt
    const pLower = prompt.toLowerCase();
    const isSunset = pLower.includes("sunset") || pLower.includes("evening") || pLower.includes("orange");
    const isCyberpunk = style.toLowerCase().includes("cyberpunk") || pLower.includes("cyber") || pLower.includes("neon");
    const isWatercolor = style.toLowerCase().includes("watercolor");
    const isAnime = style.toLowerCase().includes("anime");
    const isDark = pLower.includes("night") || pLower.includes("dark") || pLower.includes("moon") || isCyberpunk;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width * 0.5, height);
    if (isCyberpunk) {
      grad.addColorStop(0, "#0B001A");
      grad.addColorStop(0.5, "#1F0338");
      grad.addColorStop(1, "#031B33");
    } else if (isSunset) {
      grad.addColorStop(0, "#1F1B38");
      grad.addColorStop(0.3, "#6C2753");
      grad.addColorStop(0.65, "#E2583E");
      grad.addColorStop(1, "#F7A84B");
    } else if (isWatercolor) {
      grad.addColorStop(0, "#EBF4F6");
      grad.addColorStop(0.5, "#D8EFF0");
      grad.addColorStop(1, "#F7E8E4");
    } else if (isAnime) {
      grad.addColorStop(0, "#4A80F0");
      grad.addColorStop(0.6, "#99C7FF");
      grad.addColorStop(1, "#F5E6CC");
    } else if (isDark) {
      grad.addColorStop(0, "#080B14");
      grad.addColorStop(0.6, "#121A2B");
      grad.addColorStop(1, "#1A253D");
    } else {
      grad.addColorStop(0, "#23283E");
      grad.addColorStop(0.5, "#4B5B84");
      grad.addColorStop(1, "#7D8BAA");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // If sketch was provided, composite enhanced outlines
    if (baseSketchUrl) {
      const sketchImg = new Image();
      sketchImg.crossOrigin = "anonymous";
      sketchImg.onload = () => {
        ctx.save();
        ctx.globalCompositeOperation = isDark ? "screen" : "multiply";
        ctx.globalAlpha = 0.65;
        ctx.drawImage(sketchImg, 0, 0, width, height);
        ctx.restore();
        renderDecorativeArtwork();
      };
      sketchImg.onerror = () => renderDecorativeArtwork();
      sketchImg.src = baseSketchUrl;
    } else {
      renderDecorativeArtwork();
    }

    function renderDecorativeArtwork() {
      // Atmospheric celestial sphere / sun / moon
      ctx.save();
      const sunX = width * 0.65;
      const sunY = height * 0.35;
      const sunR = Math.min(width, height) * 0.16;

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.5);
      if (isCyberpunk) {
        sunGlow.addColorStop(0, "rgba(255, 0, 128, 0.9)");
        sunGlow.addColorStop(0.5, "rgba(0, 240, 255, 0.4)");
        sunGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (isSunset) {
        sunGlow.addColorStop(0, "rgba(255, 240, 180, 0.95)");
        sunGlow.addColorStop(0.4, "rgba(255, 120, 50, 0.6)");
        sunGlow.addColorStop(1, "rgba(255, 50, 100, 0)");
      } else {
        sunGlow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        sunGlow.addColorStop(0.5, "rgba(180, 220, 255, 0.4)");
        sunGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric distant silhouettes (mountains / city skyline / fantasy landscape)
      ctx.fillStyle = isCyberpunk
        ? "#05010B"
        : isSunset
        ? "#2B0F2A"
        : isDark
        ? "#070B12"
        : "#1A2234";

      // Mountain 1 (distant)
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.68);
      ctx.lineTo(width * 0.25, height * 0.48);
      ctx.lineTo(width * 0.52, height * 0.62);
      ctx.lineTo(width * 0.8, height * 0.42);
      ctx.lineTo(width, height * 0.6);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = 0.5;
      ctx.fill();

      // Mountain 2 (foreground)
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.78);
      ctx.lineTo(width * 0.35, height * 0.6);
      ctx.lineTo(width * 0.7, height * 0.75);
      ctx.lineTo(width, height * 0.68);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Foreground terrain
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.88);
      ctx.bezierCurveTo(width * 0.3, height * 0.84, width * 0.7, height * 0.92, width, height * 0.86);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = 1.0;
      ctx.fill();

      // Cyberpunk or Anime light particles
      ctx.fillStyle = isCyberpunk ? "#00F0FF" : isSunset ? "#FFD080" : "#FFFFFF";
      for (let i = 0; i < 45; i++) {
        const px = Math.random() * width;
        const py = Math.random() * height * 0.75;
        const pr = Math.random() * 2.5 + 0.5;
        ctx.globalAlpha = Math.random() * 0.7 + 0.3;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Prototype watermark banner on the fallback preview
      ctx.save();
      ctx.fillStyle = "rgba(18, 18, 24, 0.85)";
      ctx.fillRect(20, height - 60, width - 40, 42);
      ctx.strokeStyle = "rgba(124, 92, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, height - 60, width - 40, 42);

      ctx.fillStyle = "#A0A0B0";
      ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(
        `AI Studio Prototype Engine (${style}) • "${prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}"`,
        36,
        height - 34
      );
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    }
  });
}

class AIServiceImpl implements AIService {
  async checkHealth(): Promise<{ hasApiKey: boolean }> {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) return { hasApiKey: false };
      const data = await res.json();
      return { hasApiKey: Boolean(data.hasApiKey) };
    } catch {
      return { hasApiKey: false };
    }
  }

  async generateImage(request: GenerateImageRequest): Promise<AIResult> {
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          imageUrl: data.imageUrl,
          caption: data.caption,
          prompt: request.prompt,
          style: String(request.style),
          provider: "gemini",
          timestamp: Date.now(),
        };
      }

      const errData = await response.json().catch(() => ({}));
      console.warn("Server AI generate returned error, using fallback preview:", errData);

      // Graceful prototype fallback
      const fallbackUrl = await createArtisticFallbackCanvas(
        request.prompt,
        String(request.style),
        request.aspectRatio
      );

      return {
        imageUrl: fallbackUrl,
        caption: "Prototype Preview: Generated using local creative engine. Add GEMINI_API_KEY in Secrets for live Gemini Image model.",
        prompt: request.prompt,
        style: String(request.style),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    } catch (err: any) {
      console.warn("AI generation network error, utilizing local artistic engine:", err);
      const fallbackUrl = await createArtisticFallbackCanvas(
        request.prompt,
        String(request.style),
        request.aspectRatio
      );
      return {
        imageUrl: fallbackUrl,
        caption: "Prototype Preview: Local engine generated artwork.",
        prompt: request.prompt,
        style: String(request.style),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    }
  }

  async sketchToImage(request: SketchRequest): Promise<AIResult> {
    try {
      const response = await fetch("/api/ai/sketch-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          imageUrl: data.imageUrl,
          caption: data.caption,
          prompt: request.prompt,
          style: String(request.style),
          provider: "gemini",
          timestamp: Date.now(),
        };
      }

      const fallbackUrl = await createArtisticFallbackCanvas(
        request.prompt || "Turn sketch into artwork",
        String(request.style),
        request.aspectRatio,
        request.sketchDataUrl
      );

      return {
        imageUrl: fallbackUrl,
        caption: "Prototype Sketch-to-Art Preview: Sketch composited and styled with local creative engine.",
        prompt: request.prompt,
        style: String(request.style),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    } catch (err) {
      const fallbackUrl = await createArtisticFallbackCanvas(
        request.prompt || "Turn sketch into artwork",
        String(request.style),
        request.aspectRatio,
        request.sketchDataUrl
      );
      return {
        imageUrl: fallbackUrl,
        caption: "Prototype Sketch-to-Art: Rendered via local artistic engine.",
        prompt: request.prompt,
        style: String(request.style),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    }
  }

  async editImage(request: EditImageRequest): Promise<AIResult> {
    try {
      const response = await fetch("/api/ai/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          imageUrl: data.imageUrl,
          prompt: request.instruction,
          style: String(request.style || "Custom"),
          provider: "gemini",
          timestamp: Date.now(),
        };
      }

      const fallbackUrl = await createArtisticFallbackCanvas(
        request.instruction,
        String(request.style || "Digital Art"),
        "1:1",
        request.imageDataUrl
      );

      return {
        imageUrl: fallbackUrl,
        prompt: request.instruction,
        style: String(request.style || "Custom"),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    } catch (err) {
      const fallbackUrl = await createArtisticFallbackCanvas(
        request.instruction,
        String(request.style || "Digital Art"),
        "1:1",
        request.imageDataUrl
      );
      return {
        imageUrl: fallbackUrl,
        prompt: request.instruction,
        style: String(request.style || "Custom"),
        provider: "smart-local",
        timestamp: Date.now(),
      };
    }
  }
}

export const aiService: AIService = new AIServiceImpl();

export const generateArtworkAI = (req: GenerateImageRequest) => aiService.generateImage(req);
export const sketchToImageAI = (req: SketchRequest) => aiService.sketchToImage(req);
export const editImageAI = (req: EditImageRequest) => aiService.editImage(req);
export const checkAIHealth = () => aiService.checkHealth();
