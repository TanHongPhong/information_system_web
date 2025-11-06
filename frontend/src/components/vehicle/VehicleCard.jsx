// components/VehicleCard.jsx
import React from "react";
import { Calendar, Hash, User as UserIcon } from "lucide-react";

export default function VehicleCard({ company, route, item, onSelect }) {
  const { percent, depart, plate, driver, status, location, vehicle_region, availability } = item;

  const colors = percent < 40
    ? { bg: "bg-emerald-50 ring-emerald-100 text-emerald-700", grad: "linear-gradient(90deg,#22c55e 0%,#86efac 100%)" }
    : percent < 80
    ? { bg: "bg-yellow-50 ring-yellow-100 text-yellow-700", grad: "linear-gradient(90deg,#f59e0b 0%,#fde68a 100%)" }
    : { bg: "bg-rose-50 ring-rose-100 text-rose-700", grad: "linear-gradient(90deg,#ef4444 0%,#fca5a5 100%)" };

  return (
    <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-[in_.25s_ease-out_both]">
      {/* top line */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{company}</span>
          <span className="text-slate-300">•</span>
          <span>{route}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md ${colors.bg} ${colors.text || ""} ring-1 ${colors.bg.replace("bg-","ring-")}`}>
          {status}
        </span>
      </div>

      {/* truck + overlay */}
      <div className="relative w-full max-w-[700px] mx-auto mt-4">
        <img
          src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
          alt="Xe tải"
          className="w-full h-auto select-none"
        />
        {/* overlay vùng thùng xe */}
        <div
          className="absolute grid place-items-center overflow-hidden"
          style={{ left: "19%", top: "26.2%", width: "44%", height: "27%" }}
        >
          <div
            className="absolute"
            style={{
              inset: "clamp(6px,3.5%,14px)",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,.18)",
              background: "linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06))",
              backdropFilter: "blur(1px)",
              boxShadow: "0 8px 24px rgba(0,0,0,.24)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${Math.max(0, Math.min(100, percent))}%`,
                background: colors.grad,
                borderTopLeftRadius: "14px",
                borderBottomLeftRadius: "14px",
                transition: "width .45s cubic-bezier(.22,.61,.36,1)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-extrabold text-white"
                 style={{ textShadow: "0 2px 6px rgba(0,0,0,.35)" }}>
              {percent} %
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

      {/* meta */}
      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Khởi hành: <b>{formatDateVN(depart)}</b></span>
        </li>
        <li className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          <span>Biển số: <b>{plate}</b></span>
        </li>
        <li className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          <span>Tài xế: <b>{driver}</b></span>
        </li>
        {location && (
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Vị trí: <b>{vehicle_region || location}</b></span>
          </li>
        )}
      </ul>
      
      {/* Availability status */}
      {availability && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${
          availability.available 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {availability.available ? (
            <span className="font-semibold">✓ Khả dụng</span>
          ) : (
            <span className="font-semibold">⚠ {availability.reason || 'Không khả dụng'}</span>
          )}
        </div>
      )}

      <button onClick={onSelect} className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2">
        Chọn xe
      </button>
    </article>
  );
}

function formatDateVN(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN");
}
