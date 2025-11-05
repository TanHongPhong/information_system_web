import React from "react";
import {
  CreditCardIcon,
  PlayIcon,
  HomeIcon,
  ArrowRightIcon,
} from "./FeatherIcons";

export default function VehicleRouteCard({
  plate = "51C-789.45",
  statusText = "Đang hoạt động",
  fromLabel = "TP. Hồ Chí Minh",
  toLabel = "Hà Nội",
  onDeparture,
  onWarehouseArrival,
  vehicleId,
}) {
  return (
    <section className="bg-white rounded-[1rem] shadow-[0_12px_40px_rgba(2,6,23,.08)] p-4">
      {/* Biển số + trạng thái */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50">
            <CreditCardIcon className="w-5 h-5 text-blue-600" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Biển số
            </p>
            <p className="text-2xl font-extrabold tracking-widest text-slate-900">
              {plate}
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          {statusText}
        </span>
      </div>

      {/* Tuyến đường + hành động */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Tuyến đường
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          {/* Từ -> đến */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                {fromLabel}
              </span>
            </div>

            <div className="mx-2 shrink-0 text-slate-400">
              <ArrowRightIcon className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                {toLabel}
              </span>
            </div>
          </div>

          {/* Hai nút */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={onDeparture}
              disabled={!onDeparture}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Xuất phát</span>
            </button>

            <button
              onClick={onWarehouseArrival}
              disabled={!onWarehouseArrival}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Đã tới kho</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
