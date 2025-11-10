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
  onStartLoading,
  vehicleId,
  allOrdersLoaded = false,
  hasInTransitOrders = false,
  hasAcceptedOrders = false,
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

          {/* Các nút hành động */}
          <div className="mt-3 grid gap-2">
            {/* Nút "Bắt đầu bốc hàng" - chỉ hiển thị khi có đơn ACCEPTED và chưa xuất phát */}
            {!hasInTransitOrders && hasAcceptedOrders && onStartLoading && (
              <button
                onClick={onStartLoading}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-600 active:scale-[.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Bắt đầu bốc hàng</span>
              </button>
            )}

            {/* Nút "Xuất phát" - chỉ hiển thị khi chưa có đơn hàng IN_TRANSIT và đã bốc hàng */}
            {!hasInTransitOrders && !hasAcceptedOrders && (
              <button
                onClick={onDeparture}
                disabled={!onDeparture || !allOrdersLoaded}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title={!allOrdersLoaded ? "Vui lòng bốc đủ hàng trước khi xuất phát" : ""}
              >
                <PlayIcon className="w-4 h-4" />
                <span>Xuất phát</span>
              </button>
            )}

            {/* Nút "Đã tới kho" - chỉ hiển thị khi đã có đơn hàng IN_TRANSIT (đã xuất phát) */}
            {hasInTransitOrders && (
              <button
                onClick={onWarehouseArrival}
                disabled={!onWarehouseArrival}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Đã tới kho</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
