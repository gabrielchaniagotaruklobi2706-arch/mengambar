import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support large image payloads for canvas drawings
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Router for API endpoints - mounted at both /api and / to support Vercel serverless rewrites and standalone server
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to extract base64 data and mime type from data URL
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }
  return { mimeType: "image/png", base64: dataUrl };
}

// AI: Generate Image from Prompt
apiRouter.post("/ai/generate", async (req, res) => {
  try {
    const { prompt, negativePrompt, style, aspectRatio = "1:1" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server",
        isMockable: true,
      });
    }

    const enhancedPrompt = [
      `Subject: ${prompt}`,
      style && style !== "Default" && style !== "Custom" ? `Style: ${style}` : "",
      negativePrompt ? `Negative constraints: Avoid ${negativePrompt}` : "",
      "High quality, visually compelling digital artwork, masterfully composed.",
    ]
      .filter(Boolean)
      .join(". ");

    // Using gemini-3.1-flash-image for high fidelity image generation
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || "1:1",
        },
      },
    });

    let imageUrl = "";
    let captionText = "";

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      } else if (part.text) {
        captionText += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: "The model did not return image data. " + (captionText ? `Model note: ${captionText}` : ""),
      });
    }

    return res.json({
      success: true,
      imageUrl,
      caption: captionText || undefined,
      provider: "gemini",
    });
  } catch (error: any) {
    console.error("AI Generate Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate image",
      isMockable: true,
    });
  }
});

// AI: Sketch to Image
apiRouter.post("/ai/sketch-to-image", async (req, res) => {
  try {
    const { sketchDataUrl, prompt, style, aspectRatio = "1:1" } = req.body;

    if (!sketchDataUrl) {
      return res.status(400).json({ error: "sketchDataUrl is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server",
        isMockable: true,
      });
    }

    const { mimeType, base64 } = parseDataUrl(sketchDataUrl);

    const promptText = [
      "Transform this hand-drawn sketch into a polished, highly detailed finished illustration.",
      prompt ? `Description of intended scene: ${prompt}` : "",
      style && style !== "Default" && style !== "Custom" ? `Artistic Style: ${style}` : "",
      "Strictly preserve the original layout, subject outlines, shapes, and spatial composition from the sketch while rendering rich textures, lighting, shading, and vibrant palette.",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || "1:1",
        },
      },
    });

    let imageUrl = "";
    let captionText = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      } else if (part.text) {
        captionText += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: "Model did not return transformed image data.",
      });
    }

    return res.json({
      success: true,
      imageUrl,
      caption: captionText || undefined,
      provider: "gemini",
    });
  } catch (error: any) {
    console.error("AI Sketch Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to convert sketch to image",
      isMockable: true,
    });
  }
});

// AI: Edit Image with instruction
apiRouter.post("/ai/edit-image", async (req, res) => {
  try {
    const { imageDataUrl, instruction, style } = req.body;

    if (!imageDataUrl || !instruction) {
      return res.status(400).json({ error: "imageDataUrl and instruction are required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server",
        isMockable: true,
      });
    }

    const { mimeType, base64 } = parseDataUrl(imageDataUrl);

    const editPrompt = [
      `Modify and edit the provided image according to this instruction: ${instruction}.`,
      style && style !== "Default" && style !== "Custom" ? `Apply style: ${style}.` : "",
      "Retain the rest of the image consistent in quality and lighting while flawlessly executing the modification.",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          { text: editPrompt },
        ],
      },
    });

    let imageUrl = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: "Model did not return edited image data.",
      });
    }

    return res.json({
      success: true,
      imageUrl,
      provider: "gemini",
    });
  } catch (error: any) {
    console.error("AI Edit Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to edit image",
      isMockable: true,
    });
  }
});

// Mount API router on both /api and / to seamlessly support direct requests and Vercel rewrites
app.use("/api", apiRouter);
app.use("/", apiRouter);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Drawing Studio server running on http://localhost:${PORT}`);
  });
}

// Only start the listening HTTP server when running standalone (e.g. Docker, Cloud Run, local dev)
// On Vercel, the app instance is exported for serverless functions
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
export default app;
