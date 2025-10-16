import { useEffect } from "react";
import feather from "feather-icons";

const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN");

function tagColor(p){
  if (p < 40) return {bg:'bg-emerald-50', ring:'ring-emerald-100', text:'text-emerald-700', fill:'linear-gradient(90deg,#22c55e 0%,#86efac 100%)'};
  if (p < 80) return {bg:'bg-yellow-50',  ring:'ring-yellow-100',  text:'text-yellow-700',  fill:'linear-gradient(90deg,#f59e0b 0%,#fde68a 100%)'};
  return            {bg:'bg-rose-50',     ring:'ring-rose-100',    text:'text-rose-700',    fill:'linear-gradient(90deg,#ef4444 0%,#fca5a5 100%)'};
}

export default function VehicleGrid({ company, route, items }) {
  // Icons trong content (nhỏ hơn header)
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [items]);

  return (
    <div id="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
      {items.map((it) => {
        const c = tagColor(it.percent);
        return (
          <article key={it.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-in">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{company}</span>
                <span className="text-slate-300">•</span>
                <span>{route}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md ${c.bg} ${c.text} ring-1 ${c.ring}`}>{it.status}</span>
            </div>

            <div className="relative w-full max-w-[700px] mx-auto mt-4 truck-wrap" style={{ "--p": String(it.percent / 100) }}>
              <img
                src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
                alt="Xe tải"
                className="w-full h-auto select-none"
              />
              <div className="trailer-overlay">
                <div className="trailer-frame">
                  <div className="trailer-fill" style={{ background: c.fill }}></div>
                  <div className="percent-display">{it.percent} %</div>
                </div>
              </div>
            </div>

            <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

            <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
              <li className="flex items-center gap-2"><i data-feather="calendar" className="w-4 h-4" /><span>Khởi hành: <b>{fmtDate(it.depart)}</b></span></li>
              <li className="flex items-center gap-2"><i data-feather="hash" className="w-4 h-4" /><span>Biển số: <b>{it.plate}</b></span></li>
              <li className="flex items-center gap-2"><i data-feather="user" className="w-4 h-4" /><span>Tài xế: <b>{it.driver}</b></span></li>
            </ul>

            <button className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2">
              Chọn xe
            </button>
          </article>
        );
      })}
    </div>
  );
}
