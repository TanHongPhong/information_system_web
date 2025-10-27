import React from "react";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
} from "./FeatherIcons";

export default function PreTripChecklist() {
  return (
    <section className="bg-white rounded-[1rem] shadow-[0_12px_40px_rgba(2,6,23,.08)] p-4">
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
        <div className="text-sm">
          Xác nhận:{" "}
          <span className="text-slate-600">
            Hàng đã chằng buộc an toàn, đủ niêm phong.
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg py-2.5 bg-slate-100 text-slate-800 active:scale-[.98]">
          <AlertTriangleIcon className="w-4 h-4" />
          <span>Sự cố / Ghi chú</span>
        </button>

        <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[.98]">
          <CheckIcon className="w-4 h-4" />
          <span>Xác nhận hàng</span>
        </button>
      </div>
    </section>
  );
}
