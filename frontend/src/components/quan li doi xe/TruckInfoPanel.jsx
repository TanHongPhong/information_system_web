import React from "react";
import { Package, BarChart2, Inbox, Clock, Hash, User, MapPin, Activity, Phone } from "lucide-react";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl grid place-items-center bg-[#E9F2FF] text-[#4A90E2]">
        <Icon className="w-[22px] h-[22px]" />
      </div>
      <div>
        <div className="text-[13px] text-slate-500">{label}</div>
        <div className="text-[18px] text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function KV({ icon: Icon, k, v }) {
  return (
    <div className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-[#F8FBFF]">
      <div className="w-7 h-7 rounded-md grid place-items-center bg-[#E9F2FF] text-[#4A90E2] flex-none">
        <Icon className="w-4 h-4" />
      </div>
      <div className="leading-tight">
        <div className="text-xs text-slate-500">{k}</div>
        <div className="text-sm text-slate-900 whitespace-nowrap">{v}</div>
      </div>
    </div>
  );
}

export default function TruckInfoPanel({ selected, loadPercent, maxTon = 15 }) {
  const left = (maxTon * (100 - (Number(loadPercent) || 0))) / 100;

  return (
    <div className="flex justify-between gap-6 bg-white rounded-xl p-6 border border-slate-200 shadow">
      <div className="flex flex-col gap-5">
        <Stat icon={Package} label="Khối lượng tải" value="2.5 tấn" />
        <Stat icon={BarChart2} label="Trọng lượng tối đa" value={`${maxTon} tấn`} />
        <Stat icon={Inbox} label="Còn trống" value={`${left.toFixed(1)} tấn`} />
        <Stat icon={Clock} label="ETA dự kiến" value="11/9/2025, 22:00" />

        <div className="grid grid-cols-2 gap-2 mt-1">
          <KV icon={Hash} k="Biển số" v={selected?.plate ?? "—"} />
          <KV icon={User} k="Tài xế" v={selected?.driver ?? "—"} />
          <KV icon={MapPin} k="Tuyến" v={(selected?.route ?? "—").replace("–", " → ")} />
          <KV icon={Activity} k="Trạng thái" v={selected ? selected.status[0].toUpperCase() + selected.status.slice(1) : "—"} />
          <KV icon={Clock} k="Mốc kế tiếp" v={selected?.times?.[3] ?? "—"} />
          <KV icon={Phone} k="Liên hệ nhanh" v="Gọi tài xế / Điều phối" />
        </div>
      </div>

      {/* chỗ hiển thị xe + thùng */}
      <div className="relative flex-1 min-h-[200px] flex items-center justify-end">
        <div className="relative w-[min(620px,40vw)]">
          <img
            className="w-full h-auto"
            alt="Truck"
            src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
          />
          {/* cargo overlay */}
          <div className="absolute left-[20%] top-[30%] w-[42%] h-[33%]">
            <div className="absolute inset-0 rounded bg-white/60 backdrop-blur-[1px] shadow-inner ring-1 ring-black/5 overflow-hidden" />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500"
              style={{ width: `${loadPercent}%` }}
            />
            <div className="absolute inset-0 grid place-items-center text-white drop-shadow">
              <span className="text-[clamp(14px,2vw,22px)]">{Number(loadPercent) || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
