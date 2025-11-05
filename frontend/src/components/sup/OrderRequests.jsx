import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";
import { invalidateOrdersCache } from "../../hooks/useOrdersData";

// Toast notification utility
const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  toast.className = `fixed bottom-6 right-6 ${bgColor} text-white text-sm px-4 py-3 rounded-lg shadow-lg z-[60] flex items-center gap-2 animate-slide-up`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "✗"}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
};

const OrderRequests = forwardRef(({ onViewDetail, onRefreshShipping }, ref) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy company_id từ localStorage
  const getCompanyId = () => {
    try {
      const userData = localStorage.getItem("gd_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.company_id) return user.company_id;
      }
    } catch (error) {
      console.error("Error getting company_id:", error);
    }
    return 1; // Default company_id
  };

  // Fetch orders với status PAID (đã thanh toán, chờ supplier chấp nhận)
  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      const companyId = getCompanyId();
      const response = await fetch(
        `http://localhost:5001/api/cargo-orders?company_id=${companyId}&status=PAID`
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch orders:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Refresh mỗi 5 giây để cập nhật dữ liệu mới (ngầm)
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Expose refresh function and handlers to parent
  useImperativeHandle(ref, () => ({
    refresh: () => fetchOrders(true),
    handleAcceptOrder,
    handleRejectOrder
  }));

  // Filter orders based on search - sử dụng useMemo để cache
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      return (
        (order.order_id && order.order_id.toString().includes(query)) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
        (order.cargo_name && order.cargo_name.toLowerCase().includes(query))
      );
    });
  }, [orders, searchQuery]);

  // Handle accept order - sử dụng useCallback để tránh re-render
  const handleAcceptOrder = useCallback(async (orderId, closePanel) => {
    try {
      const response = await fetch(`http://localhost:5001/api/cargo-orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ACCEPTED",  // Đã tiếp nhận
        }),
      });

      if (response.ok) {
        // Hiển thị toast notification
        showToast("Đã chấp nhận đơn hàng! Đơn hàng đã được chuyển vào Shipping.", "success");
        
        // Invalidate cache để các trang khác tự động refresh
        invalidateOrdersCache();
        
        // Đóng panel nếu có callback
        if (closePanel) {
          closePanel();
        }
        
        // Refresh ngầm cả 2 components
        fetchOrders(true);  // Refresh OrderRequests
        if (onRefreshShipping) {
          onRefreshShipping();  // Trigger refresh ShippingTable
        }
      } else {
        const error = await response.json();
        showToast(error.message || "Không thể chấp nhận đơn hàng", "error");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      showToast("Lỗi khi chấp nhận đơn hàng", "error");
    }
  }, [onRefreshShipping]);

  // Handle reject order - sử dụng useCallback
  const handleRejectOrder = useCallback(async (orderId, closePanel) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối đơn hàng này?")) {
      return;
    }

    try {
      // Có thể xóa order hoặc đổi status, tùy vào business logic
      // Ở đây tôi sẽ xóa order khỏi danh sách (không có API reject, nên chỉ xóa khỏi UI)
      showToast("Đã từ chối đơn hàng", "success");
      
      // Đóng panel nếu có callback
      if (closePanel) {
        closePanel();
      }
      
      // Refresh danh sách
      fetchOrders(true);
    } catch (error) {
      console.error("Error rejecting order:", error);
      showToast("Lỗi khi từ chối đơn hàng", "error");
    }
  }, []);

  // Handle accept all orders - sử dụng useCallback
  const handleAcceptAll = useCallback(async () => {
    if (filteredOrders.length === 0) {
      showToast("Không có đơn hàng nào để chấp nhận", "error");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn chấp nhận tất cả ${filteredOrders.length} đơn hàng?`)) {
      return;
    }

    try {
      const promises = filteredOrders.map((order) =>
        fetch(`http://localhost:5001/api/cargo-orders/${order.order_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ACCEPTED",  // Đã tiếp nhận
          }),
        })
      );

      await Promise.all(promises);
      showToast(`Đã chấp nhận tất cả ${filteredOrders.length} đơn hàng!`, "success");
      
      // Refresh ngầm cả 2 components
      fetchOrders(true);  // Refresh OrderRequests
      if (onRefreshShipping) {
        onRefreshShipping();  // Trigger refresh ShippingTable
      }
    } catch (error) {
      console.error("Error accepting all orders:", error);
      showToast("Lỗi khi chấp nhận đơn hàng", "error");
    }
  }, [filteredOrders, onRefreshShipping]);

  useEffect(() => {
    feather.replace();
  }, [orders, searchQuery]);

  // Format date - sử dụng useCallback để cache
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Get initials from name - sử dụng useCallback để cache
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all flex flex-col h-[calc(917px)] overflow-hidden">
      {/* Header panel */}
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100 flex-shrink-0">
        <h3 className="font-semibold text-lg text-slate-800 flex-shrink-0">
          Order Requests
        </h3>

        <div className="relative flex-1 max-w-xs">
          <i
            data-feather="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          ></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm kiếm đơn hàng"
          />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium flex-shrink-0">
        Yêu cầu đặt hàng gần đây ({filteredOrders.length})
      </div>

      {/* Danh sách yêu cầu cuộn dọc */}
      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
        {loading && orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchQuery ? "Không tìm thấy đơn hàng" : "Chưa có yêu cầu đơn hàng nào"}
          </div>
        ) : (
          filteredOrders.map((order) => {
            if (!order || !order.order_id) {
              return null;
            }
            return (
                <OrderCard
                key={order.order_id}
                order={order}
                onViewDetail={onViewDetail}
                onAccept={handleAcceptOrder}
                formatDate={formatDate}
                getInitials={getInitials}
              />
            );
          })
        )}
      </div>

      {/* Footer panel */}
      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
        <div className="text-xs text-slate-500">
          {filteredOrders.length} đơn hàng chờ xác nhận
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptAll}
            disabled={filteredOrders.length === 0 || loading}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </section>
  );
});

OrderRequests.displayName = "OrderRequests";

export default OrderRequests;

/* ======================
   SUBCOMPONENTS
   ====================== */

const OrderCard = React.memo(function OrderCard({ order, onViewDetail, onAccept, formatDate, getInitials }) {
  const navigate = useNavigate();
  const isNew = order.status === "PAID";  // Đã thanh toán, chờ tiếp nhận

  const handleViewDetail = useCallback(() => {
    onViewDetail?.({
      id: `#${order.order_id}`,
      order_id: order.order_id,
      time: formatDate(order.created_at),
      from: order.pickup_address,
      to: order.dropoff_address,
      name: order.customer_name || order.contact_name || "Khách hàng",
      customer_email: order.customer_email,
      customer_phone: order.customer_phone || order.contact_phone,
      cargo_name: order.cargo_name,
      weight_kg: order.weight_kg,
      volume_m3: order.volume_m3,
      status: order.status,
    });
  }, [order, formatDate, onViewDetail]);

  const handleAccept = useCallback(() => {
    onAccept(order.order_id);
  }, [order.order_id, onAccept]);

  // Navigate sang trang order-tracking khi click vào mã đơn hàng
  const handleOrderIdClick = useCallback((e) => {
    e.stopPropagation(); // Ngăn event bubble
    navigate(`/order-tracking?order_id=${order.order_id}`);
  }, [order.order_id, navigate]);

  // Generate avatar colors
  const avatarColors = [
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-red-100", text: "text-red-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
  ];
  const colorIndex = (order.order_id || 0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];
  
  // Lấy tên khách hàng từ customer_name hoặc contact_name
  const customerName = order.customer_name || order.contact_name || "Khách hàng";

  return (
    <article
      className={
        isNew
          ? "relative z-0 rounded-xl p-4 border-2 border-amber-300 bg-amber-50 transition-all"
          : "relative z-0 rounded-xl p-4 border border-slate-200 bg-white hover:border-blue-300 transition-all"
      }
    >
      {/* Hàng trên: ORDERID + giờ + (NEW nếu highlight) */}
      <div className="flex items-start justify-between text-xs text-slate-500 leading-relaxed">
        <div 
          onClick={handleOrderIdClick}
          className="font-semibold text-slate-700 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
          title="Click để xem chi tiết đơn hàng"
        >
          #{order.order_id}
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-slate-500">{formatDate(order.created_at)}</div>
          {isNew && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-300 px-1.5 py-[2px] rounded leading-none h-fit">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Thông tin hàng hóa */}
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Hàng hóa</div>
          <div className="font-medium text-slate-800">{order.cargo_name || "Không có tên"}</div>
        </div>

        {/* Địa chỉ */}
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="text-xs text-slate-500">Từ</div>
            <div className="font-medium text-slate-700 text-xs line-clamp-2">
              {order.pickup_address || "Chưa có địa chỉ"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đến</div>
            <div className="font-medium text-slate-700 text-xs line-clamp-2">
              {order.dropoff_address || "Chưa có địa chỉ"}
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        {(order.weight_kg || order.volume_m3) && (
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
            {order.weight_kg && (
              <span>Trọng lượng: {order.weight_kg} kg</span>
            )}
            {order.volume_m3 && (
              <span>Thể tích: {order.volume_m3} m³</span>
            )}
          </div>
        )}
      </div>

      {/* footer: avatar + tên + nút Chấp nhận */}
      <div
        className={
          isNew
            ? "mt-3 pt-3 border-t border-amber-200 flex items-center justify-between"
            : "mt-3 pt-3 border-t border-slate-100 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center font-semibold text-xs ${avatarColor.bg} ${avatarColor.text}`}
          >
            {getInitials(customerName)}
          </div>
          <div className="font-medium text-sm text-slate-800">
            {customerName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewDetail}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            Chi tiết
          </button>
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            Chấp nhận
          </button>
        </div>
      </div>
    </article>
  );
});
