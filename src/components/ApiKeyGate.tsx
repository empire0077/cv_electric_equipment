/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Key, Info, Zap } from "lucide-react";

interface ApiKeyGateProps {
  onUnlock: (key: string) => void;
  defaultKey: string;
}

export default function ApiKeyGate({ onUnlock, defaultKey }: ApiKeyGateProps) {
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim() === defaultKey) {
      onUnlock(inputKey.trim());
      setError("");
    } else {
      setError("รหัสเข้าใช้งานไม่ถูกต้องกรุณาตรวจสอบอีกครั้ง (ลองใช้: GRID-SECURE-2026)");
    }
  };

  const handleUseDefault = () => {
    setInputKey(defaultKey);
    onUnlock(defaultKey);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Shield in Gold/Purple */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-900 border-2 border-[#D4AF37] shadow-lg">
            <Zap className="w-8 h-8 text-[#D4AF37]" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border border-white">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="mt-6 text-3xl font-bold text-purple-950 font-sans tracking-tight">
          EGAT / MEA / PEA Secure Gateway
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          ระบบวิเคราะห์วัสดุอุปกรณ์สายส่งระบบไฟฟ้าแรงสูงประเมินแบบเรียลไทม์
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-xl rounded-2xl sm:px-10 relative overflow-hidden">
          {/* Elegant gold decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-900 via-purple-700 to-[#D4AF37]"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-purple-950">
                Organization Access token / API Key
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="api-key"
                  type="password"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
                  placeholder="ใส่ API Key หรือรหัสความปลอดภัยองค์กร"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                ระบบนี้ถูกจำกัดสิทธิ์ใช้งานเฉพาะวิศวกรและผู้ปฏิบัติงานภายในองค์กรเท่านั้น
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer transition-colors duration-200"
              >
                ยืนยันเพื่อเข้าใช้งานระบบ
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Sandbox Preview Options</span>
              </div>
            </div>

            <button
              onClick={handleUseDefault}
              className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-[#D4AF37] text-amber-800 hover:text-amber-950 font-medium hover:bg-amber-50 text-xs bg-amber-50/40 rounded-xl cursor-pointer transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5" />
               bypass เข้าระบบทดสอบด้วยคีย์ตัวอย่างองค์กร
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-1">
          <Info className="w-3.5 h-3.5" />
          <span>Default key is <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">GRID-SECURE-2026</code></span>
        </div>
      </div>
    </div>
  );
}
