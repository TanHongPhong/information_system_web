import React from "react";

export default function Legend() {
  return (
    <div className="text-[11px] text-slate-600">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" />
        <span>NHẬP HÀNG (INBOUND)</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
        <span>XUẤT HÀNG (OUTBOUND)</span>
      </div>
    </div>
  );
}
