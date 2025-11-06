import React, { useState, useEffect, useImperativeHandle, forwardRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

const ShippingTable = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch orders với status CONFIRMED, IN_TRANSIT, COMPLETED (đã được chấp nhận)
  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      const companyId = getCompanyId();
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      // Fetch orders với các status đã được chấp nhận
      const response = await fetch(
        `${apiUrl}/cargo-orders?company_id=${companyId}`
      );

      if (response.ok) {
        const data = await response.json();
        // Filter chỉ lấy orders đã được chấp nhận (ACCEPTED, LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED, COMPLETED)
        const acceptedOrders = data.filter(
          (order) =>
            order.status === "ACCEPTED" ||
            order.status === "LOADING" ||
            order.status === "IN_TRANSIT" ||
            order.status === "WAREHOUSE_RECEIVED" ||
            order.status === "COMPLETED"
        );
        setOrders(acceptedOrders);
      } else {
        console.error("Failed to fetch orders");
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

  // Expose refresh function to parent
  React.useImperativeHandle(ref, () => ({
    refresh: () => fetchOrders(true)
  }));

  // Format date helper - sử dụng useCallback để cache
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  // Map status helper - cache để tránh tính toán lại
  const getStatusInfo = useCallback((status) => {
    const statusMap = {
      ACCEPTED: { label: "Đã tiếp nhận", tone: "blue" },
      LOADING: { label: "Bốc hàng", tone: "purple" },
      IN_TRANSIT: { label: "Đang vận chuyển", tone: "emerald" },
      WAREHOUSE_RECEIVED: { label: "Nhập kho", tone: "cyan" },
      COMPLETED: { label: "Hoàn thành", tone: "green" },
    };
    return statusMap[status] || { label: "Đang xử lý", tone: "amber" };
  }, []);

  // Map order data to table format - sử dụng useMemo để cache
  const rows = useMemo(() => {
    return orders.map((order) => {
      const statusInfo = getStatusInfo(order.status);
      
      // Format route
      const route = order.pickup_address && order.dropoff_address
        ? `${order.pickup_address.split(",")[0]} → ${order.dropoff_address.split(",")[0]}`
        : "Chưa có thông tin";

      return {
        id: `#${order.order_id}`,
        order_id: order.order_id,
        customer: order.customer_name || "Khách hàng",
        route: route,
        eta: formatDate(order.pickup_time) || "Chưa có",
        status: { label: statusInfo.label, tone: statusInfo.tone },
      };
    });
  }, [orders, formatDate, getStatusInfo]);

  // Filter rows based on search query - sử dụng useMemo để cache
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(query) ||
        row.customer.toLowerCase().includes(query)
      );
    });
  }, [rows, searchQuery]);

  useEffect(() => {
    feather.replace();
  }, [searchQuery]);

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-slate-800">
          Shipping
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
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
              <tr>
                <Th>Mã đơn hàng</Th>
                <Th>Khách hàng</Th>
                <Th>Lộ trình</Th>
                <Th>Giao hàng dự kiến</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>

            <tbody className="text-slate-700">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    {searchQuery ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => (
                  <tr
                    key={row.order_id || row.id}
                  className={`${
                    i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    } hover:bg-slate-100/60 border-b border-slate-100 last:border-0 transition-colors cursor-pointer`}
                >
                  <Td className="font-medium text-slate-800">
                      <a
                        href={`/order-tracking?order_id=${row.order_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/order-tracking?order_id=${row.order_id}`);
                        }}
                        className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                    {row.id}
                      </a>
                  </Td>
                  <Td>{row.customer}</Td>
                    <Td className="max-w-xs truncate">{row.route}</Td>
                  <Td>{row.eta}</Td>
                  <Td>
                    <Chip tone={row.status.tone}>
                      {row.status.label}
                    </Chip>
                  </Td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});

// Memoize các component con để tránh re-render không cần thiết
const Th = React.memo(function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
      {children}
    </th>
  );
});

const Td = React.memo(function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
});

const Chip = React.memo(function Chip({ tone = "blue", children }) {
  const cls = getToneClasses(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs ${cls.bg} ${cls.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`}></span>
      {children}
    </span>
  );
});

function getToneClasses(tone) {
  switch (tone) {
    case "emerald":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      };
    case "amber":
      return {
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
      };
    case "red":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
      };
    case "blue":
    default:
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      };
  }
}

ShippingTable.displayName = "ShippingTable";

export default ShippingTable;
