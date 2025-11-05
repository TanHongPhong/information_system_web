import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

import AppLayout from "../components/layout/AppLayout.jsx";
import RecentOrders from "../components/chi tiet don hang/RecentOrders.jsx";
import FleetStatus from "../components/chi tiet don hang/FleetStatus.jsx";
import ShippingTable from "../components/chi tiet don hang/ShippingTable.jsx";
import OrderRequests from "../components/chi tiet don hang/OrderRequests.jsx";
import OrderDetailSheet from "../components/chi tiet don hang/OrderDetailSheet.jsx";

export default function Dashboard() {
  const navigate = useNavigate();

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

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

  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
  };

  // render feather icons vào <i data-feather="...">
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <AppLayout className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_60%,#eef2f7_100%)]">
        <div className="max-w-[120rem] mx-auto p-4 md:p-6 pt-3">
          {/* Page header */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Chào mừng trở lại! Dưới đây là tổng quan trang quản
                lí của bạn. ☀️
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                aria-label="Date range"
              >
                <i
                  data-feather="calendar"
                  className="w-4 h-4 text-slate-500"
                ></i>
                <span className="font-medium text-sm">
                  Last 30 days
                </span>
                <i
                  data-feather="chevron-down"
                  className="w-4 h-4 text-slate-400"
                ></i>
              </button>

              <button
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                aria-label="Export"
              >
                <i
                  data-feather="download"
                  className="w-5 h-5 text-slate-600"
                ></i>
              </button>
            </div>
          </header>

          {/* Grid chính: trái 2/3, phải 1/3 */}
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {/* Cột trái */}
            <div className="xl:col-span-2 space-y-6">
              {/* 2 card nhỏ đầu dòng */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders />
                <FleetStatus />
              </div>

              {/* Bảng shipping có chiều cao bằng cột phải */}
              <ShippingTable />
            </div>

            {/* Cột phải */}
            <aside className="space-y-8 h-full">
              <OrderRequests />
            </aside>
          </div>

          {/* Footer trang */}
          <footer className="text-center text-xs text-slate-500 mt-8">
            © 2025 VT Logistics — Demo UI Tailwind &amp; Chart.js
          </footer>
        </div>

      {/* Overlay + Sheet chi tiết đơn (mở sẵn như HTML bạn đưa) */}
      <OrderDetailSheet />
    </AppLayout>
  );
}
