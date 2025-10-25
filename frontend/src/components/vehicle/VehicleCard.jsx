import React, { useEffect } from "react";
import feather from "feather-icons";

export default function VehicleCard({ item, company, route, onSelect }) {
  useEffect(() => {
    feather.replace();
  }, [item]);

  const pct = Math.max(0, Math.min(100, Number(item.percent) || 0));

  const tagColor = (p) => {
    if (p < 40)
      return {
        bg: "bg-emerald-50",
        ring: "ring-emerald-100",
        text: "text-emerald-700",
        fill: "linear-gradient(90deg,#22c55e 0%,#86efac 100%)",
      };
    if (p < 80)
      return {
        bg: "bg-yellow-50",
        ring: "ring-yellow-100",
        text: "text-yellow-700",
        fill: "linear-gradient(90deg,#f59e0b 0%,#fde68a 100%)",
      };
    return {
      bg: "bg-rose-50",
      ring: "ring-rose-100",
      text: "text-rose-700",
      fill: "linear-gradient(90deg,#ef4444 0%,#fca5a5 100%)",
    };
  };
  const c = tagColor(pct);

  const dateFmt = new Date(`${item.depart}T00:00:00`).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-[in_.25s_ease-out_both]">
      {/* top line */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{company}</span>
          <span className="text-slate-300">•</span>
          <span>{route}</span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-md ${c.bg} ${c.text} ring-1 ${c.ring}`}
        >
          {item.status}
        </span>
      </div>

      {/* Truck visual */}
      <div className="relative w-full max-w-[700px] mx-auto mt-4 truck-wrap">
        <img
          src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
          alt="Xe tải"
          className="w-full h-auto select-none"
          draggable="false"
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
              background:
                "linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06))",
              backdropFilter: "blur(1px)",
              boxShadow: "0 8px 24px rgba(0,0,0,.24)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${pct}%`,
                background: c.fill,
                borderTopLeftRadius: "14px",
                borderBottomLeftRadius: "14px",
                transition: "width .45s cubic-bezier(.22,.61,.36,1)",
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center font-extrabold text-white"
              style={{ textShadow: "0 2px 6px rgba(0,0,0,.35)" }}
            >
              {pct} %
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

      {/* meta */}
      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li>
          Khởi hành: <b>{dateFmt}</b>
        </li>
        <li>
          Biển số: <b>{item.plate}</b>
        </li>
        <li>
          Tài xế: <b>{item.driver}</b>
        </li>
      </ul>

      {/* Actions */}
      <button
        className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2"
        onClick={() => onSelect?.(item)}
        title="Chọn xe"
      >
        Chọn xe
      </button>
    </article>
  );
}
