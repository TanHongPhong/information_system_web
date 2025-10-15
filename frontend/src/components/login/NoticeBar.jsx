import React from "react";
import { Zap, Phone } from "lucide-react";

export default function NoticeBar() {
  return (
    <div className="bg-gradient-to-r from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 border-b border-white/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 border border-white/80 text-blue-700">
            <Zap className="w-3.5 h-3.5" />
            Nhanh – Minh bạch – Đúng giờ
          </span>
          <span className="hidden sm:inline subtitle-soft">
            Ưu đãi 10% cho chuyến liên tỉnh đặt trước 24h
          </span>
        </div>
        <a href="tel:19001234" className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800">
          <Phone className="w-4 h-4" /> Hotline: <strong>1900 1234</strong>
        </a>
      </div>
      <div className="h-[3px] w-full bg-ribbon bg-[length:200%_100%] animate-shine" />
    </div>
  );
}
