import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

import AppLayout from "../components/layout/AppLayout.jsx";
import RecentOrders from "../components/sup/RecentOrders";
import FleetStatus from "../components/sup/FleetStatus";
import ShippingTable from "../components/sup/ShippingTable";
import OrderRequests from "../components/sup/OrderRequests";
import OrderDetailPanel from "../components/sup/OrderDetailPanel";

export default function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const shippingTableRef = useRef(null);
  const orderRequestsRef = useRef(null);

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // Kiểm tra nếu không có user
    if (!userData) {
      logout();
      return;
    }

    // Kiểm tra: chỉ admin transport_company mới được vào trang này
    if (role !== "transport_company" || !isAdmin) {
      console.warn(`Access denied: Only admin transport_company can access this page. Role: '${role}', isAdmin: ${isAdmin}`);
      alert("Bạn không có quyền truy cập trang này. Chỉ admin công ty vận tải mới có quyền.");
      logout();
      return;
    }
  }, []);

  // render feather icons sau khi mount
  useEffect(() => {
    feather.replace();
  }, []);

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
  };

  return (
    <AppLayout className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_60%,#eef2f7_100%)]">
        <div className="max-w-[120rem] mx-auto p-4 md:p-6 pt-3">
          {/* Tiêu đề trang */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Chào mừng trở lại! Dưới đây là tổng quan trang quản lí của
                bạn. ☀️
              </p>
            </div>
          </header>

          {/* Lưới nội dung chính */}
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {/* Cột trái (2/3) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Hàng trên: 2 thẻ nhỏ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders />
                <FleetStatus />
              </div>

              {/* Bảng Shipping (cao = cột phải) */}
              <ShippingTable ref={shippingTableRef} />
            </div>

            {/* Cột phải */}
            <aside className="h-full">
              <OrderRequests 
                ref={orderRequestsRef}
                onViewDetail={setSelectedOrder}
                onRefreshShipping={() => {
                  if (shippingTableRef.current) {
                    shippingTableRef.current.refresh();
                  }
                }}
              />
            </aside>
          </div>
          
          {/* Order Detail Panel */}
          <OrderDetailPanel 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)}
            onAccept={(orderId) => {
              if (orderRequestsRef.current?.handleAcceptOrder) {
                orderRequestsRef.current.handleAcceptOrder(orderId, () => setSelectedOrder(null));
              }
            }}
            onReject={(orderId) => {
              if (orderRequestsRef.current?.handleRejectOrder) {
                orderRequestsRef.current.handleRejectOrder(orderId, () => setSelectedOrder(null));
              }
            }}
          />

          {/* Footer trang */}
          <footer className="text-center text-xs text-slate-500 mt-8">
            © 2025 VT Logistics — Demo UI Tailwind &amp; Chart.js
          </footer>
        </div>
    </AppLayout>
  );
}
