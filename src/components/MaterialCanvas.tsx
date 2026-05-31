/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { DetectedMaterial } from "../types";
import { Shield, Eye, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface MaterialCanvasProps {
  imageUrl: string;
  materials: DetectedMaterial[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  showLabels: boolean;
  showCondition: boolean;
}

export default function MaterialCanvas({
  imageUrl,
  materials,
  selectedId,
  onSelectId,
  showLabels,
  showCondition,
}: MaterialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "insulator": return { border: "border-purple-600", text: "text-purple-900", bg: "bg-purple-100", base: "purple" };
      case "conductor": return { border: "border-blue-600", text: "text-blue-900", bg: "bg-blue-100", base: "blue" };
      case "hardware": return { border: "border-amber-600", text: "text-amber-900", bg: "bg-amber-100", base: "amber" };
      case "structure": return { border: "border-slate-600", text: "text-slate-900", bg: "bg-slate-100", base: "slate" };
      case "protection": return { border: "border-emerald-600", text: "text-emerald-900", bg: "bg-emerald-100", base: "emerald" };
      default: return { border: "border-gray-500", text: "text-gray-900", bg: "bg-gray-100", base: "gray" };
    }
  };

  const getConditionStyle = (condition: string) => {
    switch (condition) {
      case "Good": return { color: "#10b981", bg: "bg-emerald-500/20", border: "border-emerald-500", textClass: "text-emerald-500", label: "สมบูรณ์ดี" };
      case "Fair": return { color: "#f59e0b", bg: "bg-amber-500/20", border: "border-amber-500", textClass: "text-amber-500", label: "ชำรุดปานกลาง" };
      case "Critical": return { color: "#ef4444", bg: "bg-red-500/20", border: "border-red-600", textClass: "text-red-500", label: "ชำรุดรุนแรง" };
      default: return { color: "#6b7280", bg: "bg-gray-500/20", border: "border-gray-500", textClass: "text-gray-500", label: "ไม่ทราบสถานะ" };
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-purple-950 flex items-center">
          <Eye className="w-5 h-5 text-purple-700 mr-2" />
          แสดงผลการจัดตำแหน่งความปลอดภัย (Spatial Bounding Overlays)
        </h3>
        <span className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded-md border border-purple-100 font-medium">
          {materials.length} components detected
        </span>
      </div>

      {/* Primary Image Viewer Container with Relative Overlays */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-slate-900 rounded-2xl shadow-xl border-2 border-purple-900/10 flex items-center justify-center transition-all"
        style={{ minHeight: "350px", maxHeight: "550px" }}
      >
        <img
          src={imageUrl}
          alt="Electrical Materials Pipeline"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain block max-h-[550px]"
        />

        {/* CSS-Percent-Based Responsive Interactive Overlays */}
        {materials.map((m) => {
          const { boundingBox, id, label, thaiLabel, category, condition } = m;
          const isSelected = selectedId === id;
          const isHovered = hoveredId === id;
          const isHighlighted = isSelected || isHovered;
          
          const catStyle = getCategoryColor(category);
          const condStyle = getConditionStyle(condition);

          // Build dynamic styles
          const leftPercent = boundingBox.xMin * 100;
          const topPercent = boundingBox.yMin * 100;
          const widthPercent = (boundingBox.xMax - boundingBox.xMin) * 100;
          const heightPercent = (boundingBox.yMax - boundingBox.yMin) * 100;

          const activeBorder = isHighlighted 
            ? "border-2 shadow-[0_0_15px_rgba(212,175,55,0.7)] border-[#D4AF37] z-30 scale-[1.01]" 
            : `border ${showCondition ? condStyle.border : catStyle.border} opacity-80 z-20`;

          const activeBg = isHighlighted 
            ? "bg-[#D4AF37]/15" 
            : `${showCondition ? condStyle.bg : "bg-transparent"}`;

          return (
            <div
              key={id}
              id={id}
              className={`absolute transition-all duration-150 cursor-pointer rounded-sm ${activeBorder} ${activeBg}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
              onClick={() => onSelectId(isSelected ? null : id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Top-Edge Corner Indicator Banners */}
              {showLabels && (
                <div
                  className={`absolute -top-6 left-0 flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md select-none transition-all ${
                    isHighlighted ? "bg-[#D4AF37] scale-105" : "bg-purple-900"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: condStyle.color }}></span>
                  <span>{thaiLabel || label}</span>
                  <span className="opacity-80">{(m.confidence * 100).toFixed(0)}%</span>
                </div>
              )}

              {/* Highlighting Pulse Ring for selected/hovered items */}
              {isHighlighted && (
                <div className="absolute inset-0 border border-[#D4AF37] animate-ping opacity-40 rounded-sm"></div>
              )}
            </div>
          );
        })}

        {materials.length === 0 && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col justify-center items-center text-center p-6 text-white">
            <HelpCircle className="w-12 h-12 text-[#D4AF37] mb-2 animate-pulse" />
            <p className="font-semibold text-lg">ยังไม่มีการประมวลผลวัตถุ</p>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              กรุณากดชักภาพ/ถ่ายรูป เลือกไฟล์ หรือใช้ภาพตัวอย่างเพื่อตรวจหาอุปกรณ์เกรดสายส่งแรงสูง
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <span className="font-semibold text-purple-950">โค้ดสีหมวดหมู่:</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-1.5"></span>ลูกถ้วย (Insulator)</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1.5"></span>สายส่ง (Conductor)</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-600 rounded-full mr-1.5"></span>ฮาร์ดแวร์/แคลมป์ (Hardware)</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-600 rounded-full mr-1.5"></span>โครงสร้าง/เสา (Structure)</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-full mr-1.5"></span>ระบบป้องกัน (Protection)</span>
      </div>
    </div>
  );
}
