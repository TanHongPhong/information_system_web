import React from "react";

const STATUS_STYLE = {
  arriving: "bg-[#E9F2FF] text-[#4A90E2] border border-[#CFE0FF]",
  loading: "bg-[#FFF8E8] text-[#B36A00] border border-[#FFE3AF]",
  preparing: "bg-[#EAFBF0] text-[#0E7B33] border border-[#CBEFD8]",
  unloading: "bg-[#F9E7FD] text-[#BD10E0] border border-[#F0CCFA]",
  departed: "bg-[#EEF2F7] text-[#334155] border border-[#E2E8F0]",
};

function Timeline({ times, active }) {
  const items = [
    { label: "Preparing", t: times[0], idx: 0 },
    { label: "Loading", t: times[1], idx: 1 },
    { label: "Unloading", t: times[2], idx: 2 },
    { label: "Arriving", t: times[3], idx: 3 },
  ];
  return (
    <ul className="mt-1">
      {items.map((it) => (
        <li key={it.idx} className="grid grid-cols-[22px_max-content_1fr] items-center gap-3 my-2">
          <span className="w-[22px] grid place-items-center">
            <span className={`tl-dot ${active === it.idx ? "tl-dot--active" : ""}`} />
          </span>
          <span className="text-slate-600 text-sm whitespace-nowrap">{it.label}</span>
          <span className="text-slate-800 text-sm justify-self-end">{it.t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function VehiclesList({ vehicles, selectedId, onSelect }) {
  return (
    <div className="flex flex-col gap-3 overflow-auto pr-2 min-h-0">
      {vehicles.map((v) => {
        const selected = v.id === selectedId;
        const badgeCls = STATUS_STYLE[v.status] || "bg-slate-100 text-slate-700 border";
        return (
          <article
            key={v.id}
            className={`relative bg-white border rounded-2xl transition p-4 grid gap-3 ${
              selected
                ? "border-blue-600 shadow-[0_10px_26px_rgba(47,111,228,.18)]"
                : "border-slate-200 hover:shadow-md hover:border-blue-200"
            }`}
            onClick={() => onSelect(v.id)}
          >
            {/* top row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 grid place-items-center border border-slate-200 text-blue-700 text-2xl">
                  🚚
                </div>
                <div className="min-w-0">
                  <div className="text-slate-900 truncate">{v.id}</div>
                  {!selected && (
                    <div className="text-slate-400 text-sm mt-0.5">{v.plate} · Tải tối đa 15 tấn</div>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-normal shadow-sm ${badgeCls}`}>
                {v.status[0].toUpperCase() + v.status.slice(1)}
              </span>
            </div>

            {/* collapsed quick actions */}
            {!selected && (
              <div className="flex items-center gap-3 justify-end">
                <a className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#CFE0FF] text-blue-700 text-sm hover:bg-[#F1F7FF]" href="#">
                  <span className="i">🔍</span> <span>Theo dõi</span>
                </a>
                <a className="text-sm text-blue-600 hover:underline" href="#">Chi tiết</a>
              </div>
            )}

            {/* expanded */}
            {selected && (
              <>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-sm bg-[#F2F6FF] border border-[#E0E9FF] text-[#263B66]">
                    {v.route}
                  </span>
                </div>
                <Timeline times={v.times} active={v.active} />
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
