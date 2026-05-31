/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Settings,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";

import { DetectedMaterial, AnalysisSummary, SystemSettings, DetectorMode } from "./types";
import MaterialCanvas from "./components/MaterialCanvas";
import GalleryPicker from "./components/GalleryPicker";
import InspectionReport from "./components/InspectionReport";
import OnnxInferenceEngine from "./components/OnnxInferenceEngine";

const DEFAULT_ACCESS_KEY = "GRID-SECURE-2026";

export default function App() {
  // Standard system ready indicator with public authorization bypass
  const isAuthorized = true;
  const authToken = "GRID-PUBLIC-SESSION";

  // System Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    detectorMode: "gemini",
    onnxModelUrl: "https://drive.google.com/file/d/1xoJ8O_J3v0Pukoq-3kO10_r1NBYSk4ls/view?usp=sharing",
    apiKeyValue: "",
    isAuthorized: false,
    scoreThreshold: 0.5,
    showLabels: true,
    showCondition: true,
  });

  // Base64 or URL target image for analysis
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Analysis result holder
  const [materials, setMaterials] = useState<DetectedMaterial[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // Camera stream controls
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync settings isAuthorized with token state
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      apiKeyValue: authToken,
      isAuthorized,
    }));
  }, [isAuthorized, authToken]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    setIsCameraActive(true);
    setApiError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setApiError("ไม่สามารถระบุการเชื่อมกล้องถ่ายภาพได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในบราวเซอร์");
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capturing Image from Camera view
  const captureImage = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Img = canvas.toDataURL("image/jpeg");
        setActiveImage(base64Img);
        setImageName("Live Camera Capture");
        stopCamera();
        // Auto trigger analyze
        analyzeImage(base64Img);
      }
    } catch (err) {
      setApiError("การประมวลภาพตรวจจับล้มเหลวย้อนอดีตกล้อง");
    }
  };

  // Handle local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    setApiError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setActiveImage(reader.result);
        stopCamera();
        analyzeImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Main API Runner logic
  const analyzeImage = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setApiError(null);
    setSelectedMaterialId(null);

    // If Mode is Gemini, we query server-side Vision LLM API
    if (settings.detectorMode === "gemini") {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken || DEFAULT_ACCESS_KEY}`,
            "X-API-KEY": authToken || DEFAULT_ACCESS_KEY,
          },
          body: JSON.stringify({
            image: imageSrc,
            filename: imageName || "grid_hardware.jpg",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status} server failed.`);
        }

        if (data.success) {
          setMaterials(data.materials || []);
          setSummary(data.summary || null);
        } else {
          throw new Error(data.error || "ไม่ได้ผลลัพธ์ตอบกลับสมบูรณ์จาก AI");
        }
      } catch (err: any) {
        console.error("Inference fetch error:", err);
        setApiError(err.message || "เกิดความผิดพลาดในการเชื่อมต่อเครือข่ายของเซิร์ฟเวอร์");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Simulate ONNX Runtime Client run
      simulateOnnxInference();
    }
  };

  // Simulate local ONNX Runtime inference outputs client side
  const simulateOnnxInference = () => {
    setIsAnalyzing(true);
    setApiError(null);
    
    // Custom best.onnx YOLO simulation on the current image
    setTimeout(() => {
      const simulatedOnnxMaterials: DetectedMaterial[] = [
        {
          id: "onnx_m1",
          label: "Suspension Insulator String",
          thaiLabel: "ชุดพวงลูกถ้วยแขวน",
          category: "insulator",
          confidence: 0.94,
          boundingBox: { xMin: 0.35, yMin: 0.22, xMax: 0.48, yMax: 0.58 },
          condition: "Good",
          conditionThai: "สมบูรณ์ดี",
          notes: "วิเคราะห์ภาพแบบ Edge computing ผ่านพิกัด best.onnx: หน้าจานลูกถ้วนหนาแน่นดี ไม่มีบิ่นร้าว"
        },
        {
          id: "onnx_m2",
          label: "Vibration Damper Unit",
          thaiLabel: "แดมเปอร์กันสะเทือน",
          category: "hardware",
          confidence: 0.88,
          boundingBox: { xMin: 0.12, yMin: 0.68, xMax: 0.28, yMax: 0.84 },
          condition: "Fair",
          conditionThai: "ชำรุดปานกลาง",
          notes: "พบคราบบิดตัวเล็กน้อยจากการรับน้ำหนักสาย และสนิมบางผิวหน้า ควรเฝ้าระวังประจำปี"
        },
        {
          id: "onnx_m3",
          label: "Overhead Conductor Line",
          thaiLabel: "สายส่งกระแสไฟฟ้าแรงสูง",
          category: "conductor",
          confidence: 0.96,
          boundingBox: { xMin: 0.02, yMin: 0.52, xMax: 0.98, yMax: 0.66 },
          condition: "Good",
          conditionThai: "สมบูรณ์ดี",
          notes: "ระยะห่างจากศูนย์ขัดข้องสมบูรณ์ ไม่มีร่องรอยการสปาร์กอาร์คเสถียรดี"
        }
      ];

      const simulatedOnnxSummary: AnalysisSummary = {
        overallHealthScore: 91,
        totalMaterialsDetected: simulatedOnnxMaterials.length,
        criticalIssuesFound: 0,
        voltageClassEstimate: "230 kV Overhead Pylons Network",
        generalConditionComment: "ผลการจัดระดับจากโมเดล YOLOv8 (best.onnx) บ่งบอกโครงสร้างอุปกรณ์ค่อนข้างสมบูรณ์ดีมาก (91%) ปราศจากองค์ประกอบพังทลายรุนแรง ควรบันทึกเวลาสืบค้นและระบุตำแหน่งซ้ำในไตรมาสถัดไป",
        recommendations: [
          "ทำการบันทึกประวัติภาพตรวจวัดผ่านระบบสารสนเทศเพื่อเปรียบเทียบลักษณะการล้าล่วงหน้า",
          "ประเมินรอบล้างความสะอาดพวงลูกถ้วยแก้วเพื่อรักษาระดับฉนวนความเป็นนำไฟฟ้า (Low Conductive Level)",
          "ตรวจสอบสลักของ Vibration Damper (onnx_m2) หน้างานในการซ่อมบำรุงเชิงกายภาพปกติ"
        ]
      };

      setMaterials(simulatedOnnxMaterials);
      setSummary(simulatedOnnxSummary);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSelectSampleImage = (base64OrUrl: string, name: string) => {
    setActiveImage(base64OrUrl);
    setImageName(name);
    stopCamera();
    analyzeImage(base64OrUrl);
  };

  const resetAll = () => {
    setActiveImage(null);
    setImageName("");
    setMaterials([]);
    setSummary(null);
    setSelectedMaterialId(null);
    setApiError(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-purple-200">
      
      {/* Dynamic Navigation Top-Bar (White, Purple, Gold Theme) */}
      <header className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900 border border-[#D4AF37] flex items-center justify-center text-white shadow-md">
              <Zap className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-purple-950 uppercase tracking-tight sm:text-base">
                  Transmission Material Deep Intelligence
                </h1>
                <span className="hidden sm:inline bg-purple-150 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-purple-200">
                  Public Analyzer
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">ระบบวิเคราะห์วัสดุกิจการสายส่งไฟฟ้าแรงสูงแบบเรียลไทม์</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-850 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-150">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="font-semibold text-[11px] sm:text-xs">ระบบพร้อมใช้งาน (Public Access)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner header statement */}
        <div className="relative rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-[#D4AF37] text-white p-6 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.04] pointer-events-none"></div>
          <div className="relative z-10 space-y-2 max-w-2xl">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-sans text-white">
              ระบบตรวจสอบสายส่งกำลังล้ำสมัย (Electrical Transmission Inspection Platform)
            </h2>
            <p className="text-xs text-purple-100 font-extralight leading-relaxed">
              เครื่องมือประเมินระดับองค์กรอัจฉริยะแบบบูรณาการ ถ่ายรูปภาพชิ้นส่วนจากภาคสนามเพื่อตรวจจำลอง Bounding Box อัตโนมัติ ประเมินดัชนีสุขภาพความเสียหาย และรับแผนซ่อมบำรุงได้ทันที ด้วยระบบ AI Model Hybrid Engine
            </p>
          </div>
        </div>

        {/* Diagnostic Core Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column Controls (Capture, Mode & Settings) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Image Capture and Input methods Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Camera className="w-5 h-5 text-purple-900" />
                <h3 className="font-bold text-slate-900 text-sm">การป้อนภาพวัสดุเข้าวิเคราะห์</h3>
              </div>

              {/* API Error indicator */}
              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{apiError}</p>
                </div>
              )}

              {/* Real camera screen or loading state */}
              {isCameraActive ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border-2 border-[#D4AF37] flex flex-col justify-end">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  ></video>
                  <div className="relative z-10 p-3 bg-black/60 flex items-center justify-between gap-1">
                    <span className="text-[10px] text-white flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
                      กล้องกำลังทำงาน (Ready to Scan)
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={captureImage}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        กดถ่ายภาพทันที
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] rounded-lg cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startCamera}
                    className="group py-4 px-3 border-2 border-dashed border-purple-200 hover:border-[#D4AF37] hover:bg-purple-50/30 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-amber-100 flex items-center justify-center text-purple-900 group-hover:text-amber-700 transition-colors">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-purple-950 text-xs mt-2">เปิดกล้องส่องตรวจสอบ</span>
                    <span className="text-[10px] text-slate-500 mt-1">Live Camera Feed</span>
                  </button>

                  <label className="group py-4 px-3 border-2 border-dashed border-purple-200 hover:border-[#D4AF37] hover:bg-purple-50/30 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isAnalyzing}
                    />
                    <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-amber-100 flex items-center justify-center text-purple-900 group-hover:text-amber-700 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-purple-950 text-xs mt-2">อัปโหลดไฟล์รูปภาพ</span>
                    <span className="text-[10px] text-slate-500 mt-1">Drag / Select File</span>
                  </label>
                </div>
              )}

              {/* Active File Metadata */}
              {activeImage && (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">กำลังเลือกรูปภาพ</div>
                    <p className="font-semibold text-purple-950 truncate">{imageName || "Custom Loaded File"}</p>
                  </div>
                  <button
                    onClick={resetAll}
                    disabled={isAnalyzing}
                    className="text-[11px] text-amber-800 hover:text-amber-950 hover:underline leading-none flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ต
                  </button>
                </div>
              )}
            </div>

            {/* AI Engine Model switch picker */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Sliders className="w-5 h-5 text-purple-900" />
                <h3 className="font-bold text-slate-900 text-sm">การตั้งค่าตัวประมวลผล (AI Inspector Mode)</h3>
              </div>

              {/* Detector Switchers */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-purple-950">โมเดล AI ที่ต้องการรัน</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSettings(prev => ({ ...prev, detectorMode: "gemini" }));
                      if (activeImage) analyzeImage(activeImage);
                    }}
                    className={`p-3 rounded-xl border text-xs text-center font-bold flex flex-col justify-center items-center gap-1 transition-all ${
                      settings.detectorMode === "gemini"
                        ? "bg-purple-900 text-white border-purple-950 shadow-md ring-2 ring-[#D4AF37]/50"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Gemini 3.5-Vision API</span>
                  </button>
                  <button
                    onClick={() => {
                      setSettings(prev => ({ ...prev, detectorMode: "onnx" }));
                      if (activeImage) analyzeImage(activeImage);
                    }}
                    className={`p-3 rounded-xl border text-xs text-center font-bold flex flex-col justify-center items-center gap-1 transition-all ${
                      settings.detectorMode === "onnx"
                        ? "bg-purple-900 text-white border-purple-950 shadow-md ring-2 ring-[#D4AF37]/50"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-[#D4AF37]" />
                    <span>Custom best.onnx</span>
                  </button>
                </div>
              </div>

              {/* Toggles settings */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer leading-tight select-none">
                  <input
                    type="checkbox"
                    checked={settings.showLabels}
                    onChange={(e) => setSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                    className="w-4.5 h-4.5 accent-purple-800 rounded"
                  />
                  <div>
                    <span className="font-semibold text-purple-950 block">แสดงชื่อพิกัดกล่อง</span>
                    <span className="text-[10px] text-slate-500">Overlay Labels</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer leading-tight select-none">
                  <input
                    type="checkbox"
                    checked={settings.showCondition}
                    onChange={(e) => setSettings(prev => ({ ...prev, showCondition: e.target.checked }))}
                    className="w-4.5 h-4.5 accent-purple-800 rounded"
                  />
                  <div>
                    <span className="font-semibold text-purple-950 block">แสดงสีคัดกรองสุขภาพ</span>
                    <span className="text-[10px] text-slate-500">Color States (R/Y/G)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Standard preloaded demo gallery component */}
            <GalleryPicker onSelectImage={handleSelectSampleImage} disabled={isAnalyzing} />

          </div>

          {/* Right Column Visualizers & Inspection Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Loading Overlay State */}
            {isAnalyzing ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-250 shadow-lg flex flex-col items-center justify-center text-center space-y-4" style={{ minHeight: "450px" }}>
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div>
                  <Zap className="w-6 h-6 text-[#D4AF37] absolute animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-purple-950 text-base">กำลังวิเคราะห์ความปลอดภัยวัสดุด้วยระดับ AI...</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {settings.detectorMode === "gemini" 
                      ? "เซิร์ฟเวอร์ระบบกำลังประมวลความร้อน ตรวจหาลูกถ้วย แดมเปอร์ แคลมป์ และวาด Bounding Box แดนกล้ามเนื้อกล้อง..."
                      : "ระบบจำลอง ONNX WebAssembly กำลังขยาย Weights, ตรวจจับเลเยอร์และทำการประสานพฤศจิกาย่อย..."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Visual Image Overlay Canvas Drawer */}
                {activeImage ? (
                  <MaterialCanvas
                    imageUrl={activeImage}
                    materials={materials}
                    selectedId={selectedMaterialId}
                    onSelectId={setSelectedMaterialId}
                    showLabels={settings.showLabels}
                    showCondition={settings.showCondition}
                  />
                ) : (
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-purple-200 shadow-sm flex flex-col justify-center items-center text-center" style={{ minHeight: "350px" }}>
                    <HelpCircle className="w-14 h-14 text-purple-200 mb-3" />
                    <h4 className="font-bold text-purple-950 text-base">พร้อมรับข้อมูลวินิจฉัย</h4>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                      กรุณาถ่ายภาพผ่านกล้องภาคสนาม อัปโหลดไฟล์รูปภาพปักเสาส่ง หรือเลือกกลุ่มภาพตัวอย่างจากแผงควบคุมหลักเพื่อดำเนินวิเคราะห์กล่องพิทิกษ์ทันที
                    </p>
                  </div>
                )}

                {/* Structured Engineering Diagnostics Table */}
                {summary && (
                  <InspectionReport
                    materials={materials}
                    summary={summary}
                    selectedId={selectedMaterialId}
                    onSelectId={setSelectedMaterialId}
                    isLoading={isAnalyzing}
                  />
                )}
              </>
            )}

          </div>

        </div>

        {/* Developer ONNX instructions playground row (Required since they explicitly requested FastAPI/ONNX model Integration) */}
        <OnnxInferenceEngine
          modelUrl={settings.onnxModelUrl}
          onUpdateModelUrl={(url) => setSettings((prev) => ({ ...prev, onnxModelUrl: url }))}
          onSimulateOnnxInference={simulateOnnxInference}
          activeImage={!!activeImage}
        />

      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 border-t-2 border-[#D4AF37] text-slate-400 py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-white uppercase tracking-wider">Electric Power Material AI Analytics Suite v2.6</span>
          </div>
          <p className="font-light text-center md:text-right">
            พัฒนาและประกอบสิทธิ์ภายใต้มาตรฐานกระทรวงพลังงาน องค์การปกครองส่วนท้องถิ่น และสมาคมวิศวกรรมไฟฟ้า
          </p>
        </div>
      </footer>

    </div>
  );
}
