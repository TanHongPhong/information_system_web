import React from "react";
import Stars from "./Stars";

export default function CompaniesTable({ list, fmtVND, onSelect }) {
  return (
    <div className="border-t border-slate-200" role="table" aria-label="Danh sách công ty">
      <div
        className="hidden md:grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 pt-3 pb-2 text-slate-500 font-semibold"
        role="row"
      >
        <div>Transport company</div>
        <div>Service area</div>
        <div className="text-center">Cost</div>
        <div className="text-center">Đánh giá</div>
        <div className="text-center">Information</div>
      </div>

      <div>
        {list.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500">
            Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc thử tuyến khác.
          </div>
        ) : (
          list.map((c) => {
            const co2 = Math.round((c.cost / 1000) * 0.8);
            return (
              <div
                key={c.name}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 py-4 border-t border-slate-200 animate-in"
              >
                <div className="font-medium flex items-center gap-2">{c.name}</div>
                <div className="min-w-0 font-medium truncate">{c.area}</div>
                <div className="font-medium text-center">
                  {fmtVND(c.cost)}/KM
                  <div className="text-[11px] text-slate-500">
                    ETA: ~{(c.cost / 10000 + 2).toFixed(1)}h • CO₂ ~{co2}g/KM
                  </div>
                </div>
                <div className="text-center">
                  <Stars rating={c.rating} />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => onSelect(c)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
