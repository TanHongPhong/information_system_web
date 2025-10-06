import React from "react";

export default function CompaniesTable({ data, fmtVND }) {
  return (
    <div className="border-t border-slate-200" role="table" aria-label="Danh sách công ty">
      <div
        className="hidden md:grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_140px] gap-4 items-center px-5 pt-3 pb-2 text-slate-500 font-semibold"
        role="row"
      >
        <div className="min-w-0">Transport company</div>
        <div className="min-w-0">Service area</div>
        <div className="text-center">Cost</div>
        <div className="text-center">Information</div>
      </div>

      <div>
        {data.map((c) => (
          <div
            key={c.name}
            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_140px] gap-4 items-center px-5 py-4 border-t border-slate-200"
            role="row"
          >
            <div className="font-medium">{c.name}</div>
            <div className="min-w-0 font-medium truncate">{c.serviceArea}</div>
            <div className="font-medium text-center">{fmtVND(c.cost)}/KM</div>
            <div className="text-center">
              <button type="button" className="h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
