import React from "react";

export default function VehicleCard({ item, company, route }) {
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

  const dateFmt = new Date(`${item.depart}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-in">
      {/* local css cho phần overlay thùng xe */}
      <style>{`
        .truck-wrap{ --radius:14px; --frame-inset:clamp(6px,3.5%,14px) }
        .trailer-overlay{ position:absolute; left:19%; top:26.2%; width:44%; height:27%; display:grid; place-items:center; overflow:hidden }
        .trailer-frame{ position:absolute; inset:var(--frame-inset); border-radius:var(--radius); overflow:hidden; border:1px solid rgba(255,255,255,.18); background:linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06)); backdrop-filter:blur(1px); box-shadow:0 8px 24px rgba(0,0,0,.24) }
        .trailer-fill{ position:absolute; inset:0; border-top-left-radius:var(--radius); border-bottom-left-radius:var(--radius); transition:width .45s cubic-bezier(.22,.61,.36,1) }
        .percent-display{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,.35) }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{company}</span>
          <span className="text-slate-300">•</span>
          <span>{route}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md ${c.bg} ${c.text} ring-1 ${c.ring}`}>
          {item.status}
        </span>
      </div>

      {/* Truck visual */}
      <div className="relative w-full max-w-[700px] mx-auto mt-4 truck-wrap">
        <img
          src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
          alt="Xe tải"
          className="w-full h-auto select-none"
        />
        <div className="trailer-overlay">
          <div className="trailer-frame">
            <div
              className="trailer-fill"
              style={{ width: `${pct}%`, background: c.fill }}
            />
            <div className="percent-display">{pct} %</div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

      {/* Meta */}
      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <i data-feather="calendar" className="w-4 h-4 text-slate-400" />
          <span>
            Khởi hành: <b>{dateFmt}</b>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <i data-feather="hash" className="w-4 h-4 text-slate-400" />
          <span>
            Biển số: <b>{item.plate}</b>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <i data-feather="user" className="w-4 h-4 text-slate-400" />
          <span>
            Tài xế: <b>{item.driver}</b>
          </span>
        </li>
      </ul>

      {/* Actions */}
      <button className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2">
        Chọn xe
      </button>
    </article>
  );
}
