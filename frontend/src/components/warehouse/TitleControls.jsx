import React from "react";
import { RefreshCw } from "lucide-react";

export default function TitleControls({
  tab,
  dock,
  temp,
  onTabChange,
  onDockChange,
  onTempChange,
  onReload,
}) {
  const tabBtn = (key, label) => {
    const active = tab === key;
    return (
      <button
        key={key}
        onClick={() => onTabChange(key)}
        className={`h-10 px-3 rounded-xl text-sm border ${
          active
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Quản lý nhập / xuất kho
        </h2>
        <p className="text-slate-600">
          Theo dõi real-time, QR check-in/out, KPI & công suất kho.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2" role="tablist" aria-label="Bộ lọc nhập/xuất">
          {tabBtn("all", "Tất cả")}
          {tabBtn("in", "Nhập kho")}
          {tabBtn("out", "Xuất kho")}
          {tabBtn("hold", "Đang giữ tạm")}
        </div>

        <select
          value={dock}
          onChange={(e) => onDockChange(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          {["Tất cả", "D1", "D2", "D3", "D4", "D5", "D6"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          value={temp}
          onChange={(e) => onTempChange(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          {["Tất cả", "Thường", "Mát", "Lạnh"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={onReload}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tải lại</span>
        </button>
      </div>
    </div>
  );
}
