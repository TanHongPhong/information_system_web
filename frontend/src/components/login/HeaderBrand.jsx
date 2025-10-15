import React from "react";
import { Truck } from "lucide-react";

export default function HeaderBrand() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-badge flex items-center justify-center text-white font-extrabold shadow-blueglow">
            6A
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-blue-700 text-xl md:text-2xl">6A Logistics</div>
            <div className="subtitle-soft text-sm md:text-[13px] leading-none">Đặt xe chở hàng nhanh</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium" />

        <div className="flex items-center gap-2">
          <a
            href="homepage.html#booking"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm shadow-soft btn-shine btn-blue"
          >
            <Truck className="w-4 h-4" /> Đặt xe nhanh
          </a>
        </div>
      </div>
      <div className="h-[2px] w-full bg-ribbon bg-[length:200%_100%] animate-shine" />
    </header>
  );
}
