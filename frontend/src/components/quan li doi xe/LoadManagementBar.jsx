import React from "react";

export default function LoadManagementBar({ loadPercent, maxTon = 15 }) {
  const used = (maxTon * (Number(loadPercent) || 0)) / 100;

  return (
    <>
      <div className="flex items-center gap-2 my-2">
        <h3 className="text-[18px] text-slate-900">Load Management</h3>
        <button className="w-5 h-5 grid place-items-center rounded-full border border-slate-300 text-slate-500 text-[12px]" title="Quản lý tải trọng theo phần trăm">
          i
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div>
          {/* scale labels */}
          <div className="relative h-5 text-xs text-slate-400 select-none">
            <span className="absolute left-0">0%</span>
            <span className="absolute left-1/4 -translate-x-1/2">25%</span>
            <span className="absolute left-1/2 -translate-x-1/2">50%</span>
            <span className="absolute left-3/4 -translate-x-1/2">75%</span>
            <span className="absolute right-0">100%</span>
          </div>

          {/* bar */}
          <div className="relative h-10 rounded-lg bg-slate-100 shadow-inner overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-700 to-blue-400"
              style={{ width: `${loadPercent}%` }}
            />
            <span className="lm-sep lm-sep--25" />
            <span className="lm-sep lm-sep--50" />
            <span className="lm-sep lm-sep--75" />
          </div>
        </div>

        <div className="text-[16px] text-slate-700 whitespace-nowrap">
          <span className="font-bold text-slate-900 mr-1">{used.toFixed(1)} tấn</span>
          <span className="text-slate-500">Trong số {maxTon} tấn tải trọng tối đa</span>
        </div>
      </div>
    </>
  );
}
