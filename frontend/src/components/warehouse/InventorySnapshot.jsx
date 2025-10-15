import React from "react";
import { Box } from "lucide-react";

export default function InventorySnapshot() {
  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Box className="w-4 h-4" /> Tồn kho nhanh
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><span>Kệ thường</span><span className="font-medium">1.120 pallets</span></div>
        <div className="flex justify-between"><span>Kho mát</span><span className="font-medium">210 pallets</span></div>
        <div className="flex justify-between"><span>Kho lạnh</span><span className="font-medium">120 pallets</span></div>
      </div>
      <div className="mt-3">
        <div className="text-xs text-slate-600 mb-1">Tỷ lệ lấp đầy</div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: "72%" }} />
        </div>
      </div>
    </div>
  );
}
