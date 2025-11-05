// src/components/tracking/OrderSearchPanel.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOrdersData } from "../../hooks/useOrdersData";
import { IconSearch, IconTruck, IconEye } from "./IconsFeather";

// Các status hợp lệ cho order-tracking (từ ACCEPTED trở đi) - cho transport company
const VALID_STATUSES_COMPANY = ['ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
// Các status hợp lệ cho customer - bao gồm cả đơn đã thanh toán
const VALID_STATUSES_CUSTOMER = ['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];

export default function OrderSearchPanel({ onSelectOrder, selectedOrderId, initialOrderId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const scrollContainerRef = useRef(null);
  const orderRefs = useRef({});
  const hasSelectedInitialOrder = useRef(false);

  // Kiểm tra role để quyết định có dùng customer_id filter không
  const role = localStorage.getItem("role");
  const isCustomer = role === "user";
  
  // Tạo options object - nếu là customer thì không truyền customerId (để hook tự lấy)
  const hookOptions = {
    autoRefresh: true,
    refreshInterval: 30000,
    silentRefresh: true,
  };
  
  // Chỉ thêm customerId: null nếu KHÔNG phải customer (để rõ ràng)
  if (!isCustomer) {
    hookOptions.customerId = null;
  }
  // Nếu là customer, không truyền customerId (hook sẽ tự lấy từ localStorage)
  
  // Sử dụng hook để fetch orders với caching
  // Nếu là customer, hook sẽ tự động dùng customer_id từ localStorage
  const { orders: allOrders, loading } = useOrdersData(hookOptions);

  // Filter orders: 
  // - Customer: hiển thị tất cả đơn hàng (bao gồm PENDING_PAYMENT và PAID)
  // - Company: chỉ hiển thị các đơn hàng đã ACCEPTED và các status sau đó
  const orders = useMemo(() => {
    const validStatuses = isCustomer ? VALID_STATUSES_CUSTOMER : VALID_STATUSES_COMPANY;
    return allOrders.filter(order => validStatuses.includes(order.status));
  }, [allOrders, isCustomer]);

  // Auto-select order khi có initialOrderId hoặc khi orders load
  useEffect(() => {
    if (orders.length > 0 && onSelectOrder) {
      // Nếu có initialOrderId từ URL, tìm và select đơn hàng đó
      if (initialOrderId && !hasSelectedInitialOrder.current) {
        const orderToSelect = orders.find(order => order.order_id === initialOrderId);
        if (orderToSelect) {
          onSelectOrder(orderToSelect);
          hasSelectedInitialOrder.current = true;
          return;
        }
      }
      
      // Nếu không có selectedOrderId và không có initialOrderId, auto-select đơn hàng đầu tiên
      if (!selectedOrderId && !initialOrderId && !hasSelectedInitialOrder.current) {
        onSelectOrder(orders[0]);
        hasSelectedInitialOrder.current = true;
      }
    }
  }, [orders, initialOrderId, selectedOrderId, onSelectOrder]);

  // Filter orders với useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (order.order_id && order.order_id.toString().toLowerCase().includes(query)) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
          (order.cargo_name && order.cargo_name.toLowerCase().includes(query)) ||
          (order.pickup_address && order.pickup_address.toLowerCase().includes(query)) ||
          (order.dropoff_address && order.dropoff_address.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Filter by status
      if (statusFilter !== "all") {
        return order.status === statusFilter;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  // Scroll selected item vào center khi selectedOrderId thay đổi (khi click)
  useEffect(() => {
    if (!selectedOrderId || !scrollContainerRef.current) return;

    const element = orderRefs.current[selectedOrderId];
    if (!element) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    const containerCenter = containerRect.top + containerRect.height / 2;
    const elementCenter = elementRect.top + elementRect.height / 2;
    const offset = elementCenter - containerCenter;

    // Smooth scroll vào center khi click
    container.scrollBy({
      top: offset,
      behavior: "smooth",
    });
  }, [selectedOrderId]);


  // Get status badge - sử dụng useMemo để cache statusMap
  const statusMap = useMemo(() => ({
    PENDING_PAYMENT: { text: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800 ring-yellow-200" },
    PAID: { text: "Đã thanh toán", color: "bg-blue-100 text-blue-800 ring-blue-200" },
    ACCEPTED: { text: "Đã tiếp nhận", color: "bg-indigo-100 text-indigo-800 ring-indigo-200" },
    LOADING: { text: "Đang bốc hàng", color: "bg-purple-100 text-purple-800 ring-purple-200" },
    IN_TRANSIT: { text: "Đang vận chuyển", color: "bg-green-100 text-green-800 ring-green-200" },
    WAREHOUSE_RECEIVED: { text: "Đã nhập kho", color: "bg-cyan-100 text-cyan-800 ring-cyan-200" },
    COMPLETED: { text: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  }), []);

  const getStatusBadge = useCallback((status) => {
    const statusInfo = statusMap[status] || { text: status, color: "bg-slate-100 text-slate-800 ring-slate-200" };
    return (
      <span className={`text-[10px] px-[0.45rem] py-[0.15rem] rounded-full font-semibold tracking-wide ring-1 ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  }, [statusMap]);

  // Handle order click - sử dụng useCallback
  const handleOrderClick = useCallback((order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    }
  }, [onSelectOrder]);

  // Sort orders by created_at desc - sử dụng useMemo để cache
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [filteredOrders]);

  return (
    <section className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
          {/* sticky header trong card */}
          <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-semibold tracking-tight text-[14px]">
                ORDER SEARCH
              </h3>

              <div className="relative flex-1 min-w-[140px]">
                <input
                  className="h-9 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-[16px] h-[16px]" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "all"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Tất cả
              </button>
              {isCustomer && (
                <>
                  <button
                    onClick={() => setStatusFilter("PENDING_PAYMENT")}
                    className={`px-2.5 py-1 rounded-full ring-1 ${
                      statusFilter === "PENDING_PAYMENT"
                        ? "ring-blue-300 bg-blue-50 text-blue-700"
                        : "ring-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    Chờ thanh toán
                  </button>
                  <button
                    onClick={() => setStatusFilter("PAID")}
                    className={`px-2.5 py-1 rounded-full ring-1 ${
                      statusFilter === "PAID"
                        ? "ring-blue-300 bg-blue-50 text-blue-700"
                        : "ring-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    Đã thanh toán
                  </button>
                </>
              )}
              <button
                onClick={() => setStatusFilter("ACCEPTED")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "ACCEPTED"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Đã tiếp nhận
              </button>
              <button
                onClick={() => setStatusFilter("IN_TRANSIT")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "IN_TRANSIT"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Đang vận chuyển
              </button>
              <button
                onClick={() => setStatusFilter("COMPLETED")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "COMPLETED"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Hoàn thành
              </button>
            </div>
          </div>

          {/* Scrollable orders list */}
          <div
            ref={scrollContainerRef}
            className="mt-3 space-y-3 overflow-auto max-h-[calc(100vh-200px)] pr-1"
            style={{
              scrollbarWidth: "thin",
              scrollBehavior: "smooth",
            }}
          >
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Đang tải...
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Không tìm thấy đơn hàng nào
              </div>
            ) : (
              sortedOrders.map((order) => {
                const isSelected = order.order_id === selectedOrderId;
                return (
                  <article
                    key={order.order_id}
                    ref={(el) => {
                      if (el) {
                        orderRefs.current[order.order_id] = el;
                      } else {
                        delete orderRefs.current[order.order_id];
                      }
                    }}
                    onClick={() => handleOrderClick(order)}
                    className={`rounded-xl border transition-all ease-out cursor-pointer ${
                      isSelected
                        ? "border-[2px] border-[#2F6FE4] shadow-[0_10px_26px_rgba(47,111,228,.18)] p-4 bg-blue-50/30"
                        : "border-slate-200 bg-white hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] hover:-translate-y-px hover:border-blue-200 p-3"
                    }`}
                  >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF] shrink-0">
                  <IconTruck className="w-4 h-4" />
                </span>

                <div className="text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-[14px]">
                              {order.order_id || "—"}
                    </span>
                            {order.status && getStatusBadge(order.status)}
                  </div>

                  <div className="text-[11px] text-slate-500 leading-snug">
                            {order.license_plate && <div>{order.license_plate}</div>}
                            {order.weight_kg && (
                              <div className="whitespace-nowrap">Khối lượng: {order.weight_kg} kg</div>
                            )}
                  </div>
                </div>
              </div>

              <button
                        title={isSelected ? "Đang theo dõi" : "Theo dõi"}
                        className={`shrink-0 w-8 h-8 rounded-full grid place-items-center ring-1 transition-all ${
                          isSelected
                            ? "bg-[#1E66FF] text-white ring-blue-500/30"
                            : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-[#1E66FF] hover:text-white hover:ring-blue-500/30"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
              >
                <IconEye className="w-4 h-4" />
              </button>
            </div>

                    {/* Expanded info khi selected */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="space-y-2 text-xs text-slate-600">
                          {order.pickup_address && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">Lấy: {order.pickup_address}</span>
              </div>
                          )}
                          {order.dropoff_address && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              <span className="truncate">Giao: {order.dropoff_address}</span>
              </div>
                          )}
                          {order.customer_name && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                              <span>Khách: {order.customer_name}</span>
            </div>
                          )}
                      </div>
                      </div>
                    )}

                    {/* Collapsed info khi không selected */}
                    {!isSelected && (
                      <div className="mt-2 grid grid-cols-12 gap-2">
                        <div className="col-span-12">
                          <ul className="space-y-1 text-xs text-slate-500 leading-snug">
                            {order.pickup_address && (
                              <li className="flex items-start gap-2 truncate">
                                <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                <span className="truncate">Lấy: {order.pickup_address}</span>
                              </li>
                            )}
                            {order.dropoff_address && (
                              <li className="flex items-start gap-2 truncate">
                                <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                <span className="truncate">Giao: {order.dropoff_address}</span>
                              </li>
                            )}
                          </ul>
                </div>
                </div>
                    )}
              </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
