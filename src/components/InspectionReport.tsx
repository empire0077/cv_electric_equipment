/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DetectedMaterial, AnalysisSummary } from "../types";
import { ShieldCheck, Info, Wrench, Heart, Radio, AlertTriangle } from "lucide-react";

interface InspectionReportProps {
  materials: DetectedMaterial[];
  summary: AnalysisSummary;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  isLoading: boolean;
}

export default function InspectionReport({
  materials,
  summary,
  selectedId,
  onSelectId,
  isLoading,
}: InspectionReportProps) {
  
  const getConditionBadge = (condition: string, textThai: string) => {
    switch (condition) {
      case "Good":
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center w-fit">● {textThai}</span>;
      case "Fair":
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center w-fit">● {textThai}</span>;
      case "Critical":
        return <span className="bg-red-50 text-red-800 border border-red-200 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center w-fit animate-pulse">● {textThai}</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center w-fit">● {textThai}</span>;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return { bg: "bg-emerald-500", text: "text-emerald-600", lightBg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 65) return { bg: "bg-amber-500", text: "text-amber-600", lightBg: "bg-amber-50", border: "border-amber-200" };
    return { bg: "bg-red-500", text: "text-red-600", lightBg: "bg-red-50", border: "border-red-200" };
  };

  const healthStyle = getHealthColor(summary.overallHealthScore);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* Upper Status Bar */}
      <div className="p-5 bg-gradient-to-r from-purple-950 to-purple-900 text-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none"></div>
        <div>
          <span className="text-[10px] bg-[#D4AF37] text-purple-950 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            วิเคราะห์ผลสำเร็จ
          </span>
          <h3 className="text-lg font-bold mt-1">รายงานสรุปโครงสร้างสารสนเทศความปลอดภัยสายส่ง</h3>
          <p className="text-xs text-purple-200 font-normal">Transmission Tower Rigorous Diagnostic Report</p>
        </div>
        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm self-start sm:self-center">
          <Radio className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">ประเมินแรงดันส่ง</div>
            <div className="text-xs font-bold font-sans text-white">{summary.voltageClassEstimate || "115 kV"}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Health Gauge */}
          <div className={`p-4 rounded-2xl border ${healthStyle.border} ${healthStyle.lightBg} flex items-center space-x-4`}>
            <div className="relative flex items-center justify-center w-14 h-14">
              {/* Simple Ring background */}
              <svg className="w-14 h-14 transform -rotate-95">
                <circle cx="28" cy="28" r="24" strokeWidth="4" stroke="#e2e8f0" fill="transparent" />
                <circle cx="28" cy="28" r="24" strokeWidth="4" stroke={summary.overallHealthScore >= 85 ? "#10b981" : summary.overallHealthScore >= 65 ? "#f59e0b" : "#ef4444"} strokeDasharray={150} strokeDashoffset={150 - (150 * summary.overallHealthScore) / 100} fill="transparent" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-800">{summary.overallHealthScore}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center">
                <Heart className="w-3.5 h-3.5 mr-1" />
                ดัชนีสุขภาพโครงข่าย (Health Index)
              </div>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {summary.overallHealthScore >= 85 ? "สมบูรณ์มั่นคงดี" : summary.overallHealthScore >= 65 ? "ควรตรวจและเฝ้าระวัง" : "มีสภาพอันตรายชำรุดรุนแรง"}
              </p>
            </div>
          </div>

          {/* Detections count */}
          <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 flex items-center space-x-4">
            <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-900 border border-purple-200">
              <span className="font-bold text-lg">{summary.totalMaterialsDetected}</span>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">อุปกรณ์ตรวจพบสุทธิ</div>
              <p className="font-bold text-purple-950 text-sm mt-0.5">Items Registered</p>
            </div>
          </div>

          {/* Critical Issues indicator */}
          <div className={`p-4 rounded-2xl border ${summary.criticalIssuesFound > 0 ? "border-red-200 bg-red-50/50" : "border-emerald-100 bg-emerald-50/30"} flex items-center space-x-4`}>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${summary.criticalIssuesFound > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
              {summary.criticalIssuesFound > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">จุดบกพร่องวิกฤต (Critical Issues)</div>
              <p className={`font-bold text-sm mt-0.5 ${summary.criticalIssuesFound > 0 ? "text-red-700 font-semibold" : "text-emerald-700"}`}>
                {summary.criticalIssuesFound > 0 ? `${summary.criticalIssuesFound} จุดผิดปกติรุนแรง` : "เรียบร้อย ปราศจากจุดสำคัญชำรุด"}
              </p>
            </div>
          </div>

        </div>

        {/* Narrative Condition Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
          <div className="flex items-center space-x-1.5 text-purple-950 font-bold mb-1">
            <Info className="w-4 h-4 text-purple-900" />
            <span>ความเห็นของวิศวกรวิเคราะห์ระบบ (AI Analyst Comment):</span>
          </div>
          <p className="font-light">{summary.generalConditionComment}</p>
        </div>

        {/* List of Material Items */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-purple-950 tracking-wider uppercase border-b border-slate-100 pb-1.5 flex justify-between">
            <span>รายการวัสดุและอุปกรณ์ที่ตรวจจับพิกัดได้ (INSPECTED PARTS LIST)</span>
            <span className="text-slate-400 font-normal">คลิกเพื่อชี้เป้าพิกัด</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {materials.map((m) => {
              const isSelected = selectedId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectId(isSelected ? null : m.id)}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-amber-50/65 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-purple-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-purple-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {m.id}
                      </span>
                      <span className="font-bold text-purple-950 text-xs">
                        {m.thaiLabel || m.label}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        ({m.label})
                      </span>
                    </div>
                    {m.notes && (
                      <p className="text-[11px] text-slate-500 leading-normal pl-0">
                        {m.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <span className="text-slate-400 font-mono text-[10px]">
                      conf: {(m.confidence * 100).toFixed(0)}%
                    </span>
                    {getConditionBadge(m.condition, m.conditionThai)}
                  </div>
                </div>
              );
            })}

            {materials.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                ไม่พบข้อมูลพาร์ทชิ้นส่วนส่งผลการวินิจฉัย
              </div>
            )}
          </div>
        </div>

        {/* Actionable Engineering Recommendations */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-200/50 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900 flex items-center">
              <Wrench className="w-4 h-4 text-amber-600 mr-2" />
              มาตรการและขั้นตอนบำรุงรักษาเชิงรุกที่แนะนำ (ACTION STATEMENTS)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-amber-600 font-bold mr-2 shrink-0">[{i+1}]</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
