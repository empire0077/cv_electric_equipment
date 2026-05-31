/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox {
  // Coordinates are normalized between 0 and 1 or 0 and 1000.
  // We will store as normalized 0-1 ratio for versatility.
  xMin: number; // Left (0.0 to 1.0)
  yMin: number; // Top (0.0 to 1.0)
  xMax: number; // Right (0.0 to 1.0)
  yMax: number; // Bottom (0.0 to 1.0)
}

export interface DetectedMaterial {
  id: string;
  label: string; // e.g. "Suspension Clamp", "Porcelain Insulator"
  thaiLabel: string; // e.g. "ลูกถ้วยแขวน", "แคลมป์ยึดสาย"
  category: "insulator" | "structure" | "conductor" | "hardware" | "protection" | "other";
  confidence: number; // e.g. 0.94
  boundingBox: BoundingBox;
  condition: "Good" | "Fair" | "Critical";
  conditionThai: "สมบูรณ์ดี" | "ชำรุดปานกลาง" | "ชำรุดรุนแรง/ควรเปลี่ยน";
  notes?: string; // Optional architectural comments
}

export interface AnalysisSummary {
  overallHealthScore: number; // 0 to 100
  totalMaterialsDetected: number;
  criticalIssuesFound: number;
  voltageClassEstimate: string; // e.g., "115 kV", "230 kV", "500 kV", "Unknown"
  generalConditionComment: string;
  recommendations: string[];
}

export interface AnalysisResponseData {
  success: boolean;
  modelUsed: string;
  materials: DetectedMaterial[];
  summary: AnalysisSummary;
  imageUrl?: string;
}

export type DetectorMode = "gemini" | "onnx";

export interface SystemSettings {
  detectorMode: DetectorMode;
  onnxModelUrl: string;
  apiKeyValue: string;
  isAuthorized: boolean;
  scoreThreshold: number;
  showLabels: boolean;
  showCondition: boolean;
}
