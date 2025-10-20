// components/FilterBar.jsx
import React from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function FilterBar({ active, onChange, sort, onSort }) {
  const btn = (val, label) => (
    <button
      type="button"
      onClick={() => onChange(val)}
      className={[
        "px-3 py-1.5 text-sm rounded-full ring-1 ring-slate-200",
        active === val ? "bg-slate-900 text-white" : "hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <section className="sticky top-[56px] z-40 bg-white/95 backdrop-blur border-y border-slate-200">
      <div className="w-full px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold">Bộ lọc</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {btn("all", "Tất cả")}
          {btn("lt50", "< 50%")}
          {btn("50-80", "50–80%")}
          {btn("gt80", "> 80%")}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-slate-200 bg-white"
          >
            <option value="depart-asc">Sắp xếp: Khởi hành sớm → trễ</option>
            <option value="load-asc">% tải tăng dần</option>
            <option value="load-desc">% tải giảm dần</option>
            <option value="plate">Theo biển số (A→Z)</option>
          </select>
        </div>
      </div>
    </section>
  );
}
