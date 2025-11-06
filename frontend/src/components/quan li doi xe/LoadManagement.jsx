import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadManagement({ loadPercent, maxTon, orders = [], loading = false }) {
  const navigate = useNavigate();
  const usedTons = (maxTon * loadPercent) / 100;

  // Format date - sử dụng useCallback để cache
  const formatDate = useCallback((dateString) => {
    if (!dateString || dateString === "—") return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateString;
    }
  }, []);

  // Format route (rút gọn nếu quá dài) - sử dụng useCallback để cache
  const formatRoute = useCallback((route) => {
    if (!route) return "Chưa có thông tin";
    if (route.length > 40) {
      return route.substring(0, 37) + "...";
    }
    return route;
  }, []);

  // Handle order click - sử dụng useCallback
  const handleOrderClick = useCallback((orderId) => {
    navigate(`/order-tracking?order_id=${orderId}`);
  }, [navigate]);

  return (
    <section className="mb-4">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2 mt-2 mb-1">
        <h3
          className="text-[18px] text-[#0f172a]"
          style={{ fontWeight: 400, margin: 0 }}
        >
          Load Management
        </h3>
        <button
          className="w-5 h-5 grid place-items-center rounded-full border border-[#CBD5E1] bg-white text-[#64748B] text-[12px] leading-none cursor-help"
          title="Quản lý tải trọng theo phần trăm"
          style={{ fontWeight: 400 }}
        >
          i
        </button>
      </div>

      {/* thanh % */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-2">
        <div className="min-w-0">
          {/* nhãn % phía trên thanh */}
          <div
            className="relative text-[12px] text-[#94A3B8] h-[18px] mb-[6px] pointer-events-none"
            style={{ fontWeight: 400 }}
          >
            <span className="absolute left-0 top-0">0%</span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "25%" }}
            >
              25%
            </span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "50%" }}
            >
              50%
            </span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "75%" }}
            >
              75%
            </span>
            <span
              className="absolute top-0 -translate-x-full"
              style={{ left: "100%" }}
            >
              100%
            </span>
          </div>

          {/* thanh chính */}
          <div className="relative h-[40px] rounded-[10px] bg-[#EEF2F7] shadow-[inset_0_1px_0_rgba(255,255,255,.6)] overflow-hidden">
            {/* phần fill xanh */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[linear-gradient(90deg,#0B5BDA,#63A3FF)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.3)]"
              style={{ width: `${loadPercent}%` }}
            />

            {/* các vạch đứt 25/50/75 */}
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "25%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "50%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "75%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
          </div>
        </div>

        {/* text tổng tải bên phải thanh */}
        <div
          className="text-[16px] whitespace-nowrap text-[#374151]"
          style={{ fontWeight: 400 }}
        >
          <span
            className="text-[#111827] mr-1"
            style={{ fontWeight: 700 }}
          >
            {usedTons.toFixed(1)} tấn
          </span>
          <span className="text-[#6B7280]">
            Trong số {maxTon} tấn tải trọng tối đa
          </span>
        </div>
      </div>

      {/* Danh sách đơn hàng - gộp vào đây */}
      <div className="mt-4 pt-4 border-t border-[#EAEBF0]">
        {loading ? (
          <div className="text-center py-8 text-[13px] text-[#697386]" style={{ fontWeight: 400 }}>
            Đang tải đơn hàng...
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-[#697386]" style={{ fontWeight: 400 }}>
            Không có đơn hàng nào
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onOrderClick={handleOrderClick}
                formatDate={formatDate}
                formatRoute={formatRoute}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Memoize OrderCard để tránh re-render không cần thiết
const OrderCard = React.memo(function OrderCard({ order, onOrderClick, formatDate, formatRoute }) {
  return (
    <article
      onClick={() => onOrderClick(order.id)}
      className="bg-white border border-[#EAEBF0] rounded-[12px] p-4 flex flex-col gap-3 transition-all hover:-translate-y-[4px] hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] cursor-pointer"
    >
      <div className="flex items-center justify-between text-[12px] text-[#697386]">
        <span style={{ fontWeight: 400 }}>ID: {order.id}</span>
        <button
          className="text-[#A0AEC0] hover:text-[#697386]"
          style={{ fontWeight: 400 }}
          aria-label="More"
        >
          ...
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 min-w-[36px] rounded-[6px] grid place-items-center bg-[#E9F2FF] text-[#4A90E2] text-[16px] leading-none">
          📦
        </div>
        <div
          className="text-[16px] text-[#1C2A44]"
          style={{ fontWeight: 400 }}
        >
          {Number(order.weight || 0).toLocaleString("vi-VN")} kg
        </div>
      </div>

      <div className="text-[12px] text-[#697386] leading-[1.4] space-y-1">
        <div style={{ fontWeight: 400 }} title={order.route}>
          {formatRoute(order.route)}
        </div>
        <div style={{ fontWeight: 400 }}>{formatDate(order.date)}</div>
        {order.cargo_name && (
          <div style={{ fontWeight: 400 }} className="text-[11px] text-[#A0AEC0] truncate" title={order.cargo_name}>
            {order.cargo_name}
          </div>
        )}
      </div>
    </article>
  );
});
