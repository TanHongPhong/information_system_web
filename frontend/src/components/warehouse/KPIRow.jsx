import React from "react";
import { Package, Truck, AlertTriangle, Activity } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-slate-50",
    in: "bg-blue-50",
    out: "bg-indigo-50",
    alert: "bg-rose-50",
  };
  return (
    <div className={`rounded-2xl p-4 border border-slate-200 ${toneMap[tone] || ""}`}>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      {sub ? <div className="text-[12px] text-slate-500 mt-1">{sub}</div> : null}
    </div>
  );
}

export default function KPIRow({
  inboundToday,
  outboundToday,
  inTransitCount,
  alertsCount,
  capacityUsedPercent,
}) {
  return (
    <div className="grid md:grid-cols-5 gap-3">
      <StatCard icon={Package} label="Đã nhập hôm nay" value={inboundToday} tone="in" />
      <StatCard icon={Truck} label="Đã xuất hôm nay" value={outboundToday} tone="out" />
      <StatCard icon={Truck} label="Đang vận chuyển" value={inTransitCount} />
      <StatCard
        icon={AlertTriangle}
        label="Cảnh báo"
        value={alertsCount}
        sub="Thiếu chứng từ: 1 • Lệch khối lượng: 1"
        tone="alert"
      />
      <div className="rounded-2xl p-4 border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity className="w-4 h-4" />
          Công suất kho
        </div>
        <div className="mt-2">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              style={{ width: `${capacityUsedPercent}%` }}
            />
          </div>
        </div>
        <div className="text-[12px] text-slate-500 mt-1">
          {capacityUsedPercent}% sử dụng • 1.450/2.000 pallets
        </div>
      </div>
    </div>
  );
}
