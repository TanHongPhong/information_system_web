import React from "react";
import { Link } from "react-router-dom";

export default function MobileStickyCTA() {
  return (
    <div className="md:hidden mobile-sticky z-30">
      <div className="mx-4 mb-4 rounded-2xl shadow-[0_10px_24px_rgba(37,99,235,.32)] border border-blue-200 bg-white/95 backdrop-blur p-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold text-slate-900">Đặt xe ngay</div>
          <div className="text-[11px] text-slate-500">
            Giá hiển thị rõ — nhận xe nhanh
          </div>
        </div>
        <Link
          to="/transport-companies"
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold btn-shine btn-blue"
        >
          Bắt đầu
        </Link>
      </div>
    </div>
  );
}
