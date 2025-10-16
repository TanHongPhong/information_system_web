import { useEffect } from "react";
import feather from "feather-icons";

export default function MapTracker({ orderId, kpis = [], driver, mapImg }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  const tone = (t) => ({
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    blue:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    indigo:  "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  }[t] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-sm text-slate-500">Đang theo dõi</div>
          <h2 className="text-xl font-semibold">{orderId}</h2>
        </div>
        <div className="flex items-center gap-2">
          {kpis.map(({ icon, text, tone: t }, i) => (
            <span key={i} className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1 ${tone(t)}`}>
              <i data-feather={icon} className="w-4 h-4" />{text}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-slate-200 h-[520px]">
        <img src={mapImg} alt="Map" className="absolute inset-0 w-full h-full object-cover select-none" />
        {/* demo polyline */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 640" preserveAspectRatio="none">
          <polyline
            points="120,520 220,470 300,430 370,390 450,350 520,310 590,270 650,230 730,190"
            fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
          />
          <circle cx="120" cy="520" r="12" fill="#2563eb" />
          <circle cx="730" cy="190" r="12" fill="#2563eb" />
        </svg>

        <div className="absolute left-3 bottom-3 bg-white/95 backdrop-blur rounded-xl shadow-soft ring-1 ring-slate-200 p-3 flex items-center gap-3">
          <img src={driver?.avatar} className="w-10 h-10 rounded-full" alt="driver" />
          <div className="text-sm">
            <div className="font-semibold">Tài xế: {driver?.name}</div>
            <div className="text-xs text-slate-500">{driver?.meta}</div>
          </div>
          <a href={`tel:${driver?.phone}`} className="ml-2 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs inline-flex items-center gap-1">
            <i data-feather="phone" className="w-4 h-4" />Gọi
          </a>
        </div>
      </div>
    </div>
  );
}
