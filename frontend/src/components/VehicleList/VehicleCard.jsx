import React from "react";
import Icon from "./Icon"; // dùng Icon đã tách sẵn (nếu bạn đặt nơi khác, chỉnh đường dẫn import)

export default function VehicleCard({ item, company, route }) {
  const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN");

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

  const c = tagColor(item.percent);

  return (
    <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-in">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{company}</span>
          <span className="text-slate-300">•</span>
          <span>{route}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md ${c.bg} ${c.text} ring-1 ${c.ring}`}>{item.status}</span>
      </div>

      <div
        className="relative w-full max-w-[700px] mx-auto mt-4 truck-wrap"
        style={{ ["--p"]: String(item.percent / 100) }}
      >
        <img
          src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
          alt="Xe tải"
          className="w-full h-auto select-none"
        />

        <div className="trailer-overlay">
          <div className="trailer-frame">
            <div className="trailer-fill" style={{ background: c.fill }} />
            <div className="percent-display">{item.percent} %</div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <Icon name="calendar" />
          <span>
            Khởi hành: <b>{fmtDate(item.depart)}</b>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Icon name="hash" />
          <span>
            Biển số: <b>{item.plate}</b>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Icon name="user" />
          <span>
            Tài xế: <b>{item.driver}</b>
          </span>
        </li>
      </ul>

      <button
        type="button"
        className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2"
      >
        Chọn xe
      </button>
    </article>
  );
}
