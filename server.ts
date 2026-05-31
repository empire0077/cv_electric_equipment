/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit for carrying raw image base64 data
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Initialize Gemini Client safely with lazy check
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI Analysis fallback simulation will be triggered.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return genAI;
}

// REST API endpoint to analyze grid material images
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      res.status(400).json({ success: false, error: "Image payload is missing." });
      return;
    }

    // Extract base64 parts
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      res.status(400).json({ success: false, error: "Invalid data URL image format." });
      return;
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];

    const apiKey = process.env.GEMINI_API_KEY;

    // Simulate high-fidelity results if Gemini API key is missing (fallback behavior for local testing)
    if (!apiKey || apiKey === "MOCK_KEY") {
      console.log("No Gemini API key found. Simulating high-fidelity power-grid material detection outcome...");
      
      // We simulate actual realistic electrical detections
      const simulatedMaterials = [
        {
          id: "m_1",
          label: "Porcelain Suspension Insulator String",
          thaiLabel: "พวงลูกถ้วยเซรามิกชนิดแขวน",
          category: "insulator",
          confidence: 0.95,
          boundingBox: { xMin: 0.28, yMin: 0.15, xMax: 0.44, yMax: 0.65 },
          condition: "Fair",
          conditionThai: "ชำรุดปานกลาง",
          notes: "พบคราบเขม่าสะสมที่ผิวหมวกลูกถ้วยชั้นบน (Flashover Tracks) ควรทำความสะอาดในรอบบำรุงรักษาถัดไป"
        },
        {
          id: "m_2",
          label: "Suspension Clamp",
          thaiLabel: "แคลมป์แขวนรับสายตัวนำ",
          category: "hardware",
          confidence: 0.92,
          boundingBox: { xMin: 0.32, yMin: 0.61, xMax: 0.42, yMax: 0.73 },
          condition: "Good",
          conditionThai: "สมบูรณ์ดี",
          notes: "สลักเกลียวล็อกยึดแน่นหนาดี ไม่พบการกัดกร่อนผิดปกติ"
        },
        {
          id: "m_3",
          label: "Vibration Damper",
          thaiLabel: "อุปกรณ์ดูดซับแรงสั่นสะเทือน (แดมเปอร์)",
          category: "hardware",
          confidence: 0.89,
          boundingBox: { xMin: 0.65, yMin: 0.72, xMax: 0.82, yMax: 0.88 },
          condition: "Critical",
          conditionThai: "ชำรุดรุนแรง/ควรเปลี่ยน",
          notes: "พบรอยล้าและลวดตีเกลียวปริแยกขอบยึดสายตัวนำ (Frayed strands) เสี่ยงต่อการขาดบิดเบี้ยวจากแรงลมสะสม"
        },
        {
          id: "m_4",
          label: "Steel Lattice Tower Arm Structure",
          thaiLabel: "คานแขนเหล็กถักเสาส่งแรงสูง",
          category: "structure",
          confidence: 0.98,
          boundingBox: { xMin: 0.05, yMin: 0.08, xMax: 0.95, yMax: 0.40 },
          condition: "Good",
          conditionThai: "สมบูรณ์ดี",
          notes: "โครงสร้างมีความแข็งแรง มั่นคง ไม่มีรอยบิดและคราบสนิมขุมกัดเซาะหน้าตัด"
        }
      ];

      const simulatedSummary = {
        overallHealthScore: 78,
        totalMaterialsDetected: simulatedMaterials.length,
        criticalIssuesFound: 1,
        voltageClassEstimate: "115 kV Lines Network",
        generalConditionComment: "ระบบสายส่งโดยรวมอยู่ในเกณฑ์ค่อนข้างดี (Fair) แต่ตรวจพบปัญหารุนแรงที่ Vibration Damper (อุปกรณ์กันสะเทือน) ด้านขวา ซึ่งมีสภาพสึกหรอและปริแยกสะสม ควรวางแผนเข้าแก้ไขเปลี่ยนใหม่โดยด่วนที่สุด",
        recommendations: [
          "ทำการจัดซ่อมเปลี่ยนอุปกรณ์กันสะเทือน (Vibration Damper) หมายเลข m_3 โดยเร็ว เพื่อป้องกันสายส่งล้าและชำรุดรุนแรงขึ้น",
          "กำหนดให้ทีมซ่อมบำรุงเข้าล้างทำความสะอาดลูกถ้วยสปริงหม้อดิน (Porcelain Insulator) เพื่อลดคราบคาร์บอนและคราบเกลือ",
          "กำหนดเกณฑ์การลงพื้นที่ถ่ายตรวจสอบถัดไปภายใน 6 เดือนสม่ำเสมอ"
        ]
      };

      res.status(200).json({
        success: true,
        modelUsed: "Transmission-Analyzer-Builtin-Fallback (Simulated High Fidelity CLI)",
        materials: simulatedMaterials,
        summary: simulatedSummary
      });
      return;
    }

    // Call live Gemini 3.5-flash with image
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert Power Grid and Electrical Transmission Engineer with specializing in visual material inspection for Substation & High-Voltage Overhead Transmission Line Equipment.
Your task is to analyze the image, detect transmission materials precisely, evaluate their physical integrity (Condition), and output structural bounding boxes.

For each material:
- Determine coordinates normalized exactly between 0.0 and 1.0 (float values) as:
  xMin: left-most side of bounding box
  yMin: top-most side of bounding box
  xMax: right-most side of bounding box
  yMax: bottom-most side of bounding box

Categories allowed:
- "insulator" (Insulator types: Porcelain, Glass, Polymer, Post, Pin)
- "conductor" (Cables, stay wires, jumpers, fiber optic guard)
- "hardware" (Suspension/Strain Clamps, Dampers, Armor Rods, Spacers, corona-rings)
- "structure" (Tower lattice steel parts, concrete pillars, metal crossarms)
- "protection" (Surge arrester units, lightning guard spikes)
- "other"

Classify condition:
- "Good" (สมบูรณ์ดี) -> perfect or fully structural.
- "Fair" (ชำรุดปานกลาง) -> dirty, light surface rust or slight flash marks.
- "Critical" (ชำรุดรุนแรง/ควรเปลี่ยน) -> visible crack, broken disks, heavy corrosion, loose hardware, or structural deflection.

You MUST write professional Thai descriptions for 'thaiLabel', 'conditionThai', and detailed inspection comments to serve local utility crews. Make sure everything is enclosed in clean structure.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    };

    const textPart = {
      text: "Locate and outline all visual electrical power transmission equipment materials in this photo, specify bounding boxes, condition, and issue details."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, textPart],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            materials: {
              type: Type.ARRAY,
              description: "List of detected grid materials and components",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique sequential ID starting with m_1, m_2, etc." },
                  label: { type: Type.STRING, description: "Descriptive English name of the item" },
                  thaiLabel: { type: Type.STRING, description: "Traditional electrical name in Thai language" },
                  category: { type: Type.STRING, description: "Material super category" },
                  confidence: { type: Type.NUMBER, description: "Estimated recognition score between 0.0 and 1.0" },
                  boundingBox: {
                    type: Type.OBJECT,
                    description: "Relative normalized bounding box boundaries ranging from 0.0 to 1.0",
                    properties: {
                      xMin: { type: Type.NUMBER },
                      yMin: { type: Type.NUMBER },
                      xMax: { type: Type.NUMBER },
                      yMax: { type: Type.NUMBER }
                    },
                    required: ["xMin", "yMin", "xMax", "yMax"]
                  },
                  condition: { type: Type.STRING, description: "Good, Fair or Critical status" },
                  conditionThai: { type: Type.STRING, description: "Thai matching value for status" },
                  notes: { type: Type.STRING, description: "Detailed local engineering notes or maintenance recommendations" }
                },
                required: ["id", "label", "thaiLabel", "category", "confidence", "boundingBox", "condition", "conditionThai"]
              }
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                overallHealthScore: { type: Type.NUMBER, description: "Overall combined rating of the visible structures from 0 to 100" },
                totalMaterialsDetected: { type: Type.NUMBER },
                criticalIssuesFound: { type: Type.NUMBER },
                voltageClassEstimate: { type: Type.STRING, description: "Estimated grid voltage structure level, e.g. 115 kV, 230 kV, 500 kV" },
                generalConditionComment: { type: Type.STRING, description: "Narrative summary statement of current tower health" },
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["overallHealthScore", "totalMaterialsDetected", "criticalIssuesFound", "voltageClassEstimate", "generalConditionComment", "recommendations"]
            }
          },
          required: ["materials", "summary"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.status(200).json({
      success: true,
      modelUsed: "gemini-3.5-flash-structure-vision",
      materials: parsedData.materials || [],
      summary: parsedData.summary || {
        overallHealthScore: 100,
        totalMaterialsDetected: 0,
        criticalIssuesFound: 0,
        voltageClassEstimate: "Unknown",
        generalConditionComment: "No data detected.",
        recommendations: []
      }
    });

  } catch (err: any) {
    console.error("Gemini Vision processing error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to analyze transmission material image via AI backend."
    });
  }
});

// Serve frontend assets in production and developer Vite server under development
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Serving application in development mode with active Vite backend proxy...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving statically compiled files in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Transmission Grid Analyzer full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
