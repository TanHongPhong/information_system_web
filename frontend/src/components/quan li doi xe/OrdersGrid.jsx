import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function OrdersGrid({ orders, loading }) {
  const navigate = useNavigate();
  
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
    <section className="pt-4">
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
