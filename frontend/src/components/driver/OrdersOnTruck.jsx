import React from "react";
import { MoreHorizontalIcon, BoxIcon } from "./FeatherIcons";

const COLOR_STYLES = {
  sky: {
    cardBg: "bg-sky-50",
    ring: "ring-sky-200",
    headerText: "text-slate-600",
    iconColor: "text-sky-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  indigo: {
    cardBg: "bg-indigo-50",
    ring: "ring-indigo-200",
    headerText: "text-slate-600",
    iconColor: "text-indigo-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  emerald: {
    cardBg: "bg-emerald-50",
    ring: "ring-emerald-200",
    headerText: "text-slate-600",
    iconColor: "text-emerald-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  amber: {
    cardBg: "bg-amber-50",
    ring: "ring-amber-200",
    headerText: "text-slate-700",
    iconColor: "text-amber-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-700",
  },
  rose: {
    cardBg: "bg-rose-50",
    ring: "ring-rose-200",
    headerText: "text-slate-700",
    iconColor: "text-rose-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-700",
  },
};

function OrderCard({ order, index, onAcceptWarehouseEntry, vehicleId, warehouseLocation, updatingOrderId }) {
  // Sử dụng màu theo index nếu không có color
  const colorKeys = Object.keys(COLOR_STYLES);
  const colorKey = order.color || colorKeys[index % colorKeys.length];
  const style = COLOR_STYLES[colorKey] || COLOR_STYLES.sky;
  
  // Kiểm tra xem có thể nhập kho không (chỉ đơn hàng có status IN_TRANSIT)
  const canAcceptWarehouse = order.status === 'IN_TRANSIT' && onAcceptWarehouseEntry;
  const isUpdating = updatingOrderId === (order.order_id || order.id);

  // Format date từ API
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format weight
  const formatWeight = (weight) => {
    if (!weight) return "0";
    return typeof weight === "number" ? weight.toLocaleString("vi-VN") : weight;
  };

  return (
    <article
      className={`rounded-lg p-3 ${style.cardBg} ring-1 ring-inset ${style.ring}`}
    >
      {/* header */}
      <div
        className={`flex items-center justify-between text-[11px] ${style.headerText}`}
      >
        <span className="font-medium">ID: {order.order_id || order.id}</span>
        <MoreHorizontalIcon className="w-4 h-4" />
      </div>

      {/* Hàng hóa (cargo name) */}
      {order.cargo_name && (
        <div className="mt-1.5">
          <p className={`text-xs ${style.routeText} font-medium`}>
            {order.cargo_name}
          </p>
          {order.cargo_type && (
            <p className={`text-[10px] ${style.dateText} mt-0.5`}>
              Loại: {order.cargo_type}
            </p>
          )}
        </div>
      )}

      {/* weight / icon */}
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-white/60">
          <BoxIcon className={`w-4 h-4 ${style.iconColor}`} />
        </span>
        <div>
          <p
            className={`text-xl font-bold leading-none ${style.weightText}`}
          >{`${formatWeight(order.weight_kg || order.weight)} kg`}</p>
          {order.volume_m3 && (
            <p className={`text-[10px] ${style.dateText} mt-0.5`}>
              {order.volume_m3} m³
            </p>
          )}
        </div>
      </div>

      {/* route + date */}
      <p className={`mt-2 text-sm ${style.routeText}`}>
        {order.pickup_address && order.dropoff_address
          ? `${order.pickup_address} – ${order.dropoff_address}`
          : order.route || "Chưa có thông tin"}
      </p>
      <p className={`text-xs ${style.dateText} mt-1`}>
        {formatDate(order.created_at || order.date)}
      </p>

      {/* Status badge và button nhập kho */}
      <div className="mt-2 pt-2 border-t border-white/40">
        <div className="flex items-center justify-between gap-2">
          {order.status && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          )}
          
          {/* Button nhập kho - chỉ hiển thị khi đơn hàng có status IN_TRANSIT */}
          {canAcceptWarehouse && (
            <button
              onClick={() => {
                if (window.confirm(`Xác nhận nhập kho cho đơn hàng ${order.order_id || order.id}?`)) {
                  onAcceptWarehouseEntry(order.order_id || order.id);
                }
              }}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[.95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2 A10 10 0 0 1 22 12" strokeDasharray="8" strokeDashoffset="8"/>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Nhập kho
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// Helper function để lấy style cho status
function getStatusStyle(status) {
  const statusMap = {
    LOADING: "bg-blue-100 text-blue-700",
    IN_TRANSIT: "bg-yellow-100 text-yellow-700",
    WAREHOUSE_RECEIVED: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    ACCEPTED: "bg-purple-100 text-purple-700",
  };
  return statusMap[status] || "bg-slate-100 text-slate-700";
}

// Helper function để lấy text cho status
function getStatusText(status) {
  const statusMap = {
    LOADING: "Đang bốc hàng",
    IN_TRANSIT: "Đang vận chuyển",
    WAREHOUSE_RECEIVED: "Đã tới kho",
    COMPLETED: "Hoàn thành",
    ACCEPTED: "Đã chấp nhận",
  };
  return statusMap[status] || status;
}

export default function OrdersOnTruck({ orders = [], onAcceptWarehouseEntry, vehicleId, warehouseLocation, updatingOrderId }) {
  return (
    <section className="bg-white rounded-[1rem] shadow-[0_12px_40px_rgba(2,6,23,.08)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Đơn hàng chi tiết trên xe
        </h2>
        <span className="text-xs text-slate-500">
          {orders.length} đơn
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        {orders.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            Không có đơn hàng nào trên xe
          </div>
        ) : (
          orders.map((o, index) => (
            <OrderCard 
              key={o.order_id || o.id || index} 
              order={o} 
              index={index}
              onAcceptWarehouseEntry={onAcceptWarehouseEntry}
              vehicleId={vehicleId}
              warehouseLocation={warehouseLocation}
              updatingOrderId={updatingOrderId}
            />
          ))
        )}
      </div>
    </section>
  );
}
