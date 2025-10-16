import { useEffect } from "react";
import feather from "feather-icons";

export default function OrderItem({ id, route, percent = 0, eta, statusBadge }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  return (
    <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
            <i data-feather="package" className="w-4 h-4" />
          </span>
          <div className="text-sm min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">{id}</span>
              {statusBadge && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-blue-700 ring-1 ring-blue-300">
                  {statusBadge}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">{route}</div>
            <div className="mt-2 mini-progress"><span style={{ transform: `scaleX(${percent / 100})` }} /></div>
          </div>
        </div>
        <button
          title="Theo dõi"
          className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-blue-600 text-white ring-1 ring-blue-500/30 hover:brightness-105"
        >
          <i data-feather="map-pin" className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-slate-600">
        <div className="flex items-center gap-1"><i data-feather="clock" className="w-4 h-4" /> Dự kiến: {eta}</div>
        <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href="#"><i data-feather="download" className="w-4 h-4" />Hóa đơn</a>
      </div>

      {/* mini-progress styles */}
      <style>{`
        .mini-progress{height:8px;border-radius:9999px;background:#e5edff;position:relative;overflow:hidden}
        .mini-progress>span{position:absolute;inset:0;transform-origin:left center;background:linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)}
      `}</style>
    </article>
  );
}
