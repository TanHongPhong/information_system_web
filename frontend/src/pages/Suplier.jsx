import React, { useEffect, useState } from "react";
import feather from "feather-icons";

import Sidebar from "../components/sup/Sidebar";
import Topbar from "../components/sup/Topbar";
import RecentOrders from "../components/sup/RecentOrders";
import FleetStatus from "../components/sup/FleetStatus";
import ShippingTable from "../components/sup/ShippingTable";
import OrderRequests from "../components/sup/OrderRequests";
import OrderDetailPanel from "../components/sup/OrderDetailPanel";

export default function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // render feather icons sau khi mount
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="min-h-screen text-slate-800 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_60%,#eef2f7_100%)]">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Header cố định trên cùng (dịch qua phải 80px) */}
      <Topbar />

      {/* MAIN: đẩy nội dung xuống dưới header và qua phải khỏi sidebar */}
      <main className="ml-20 pt-[72px]">
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
                  30 ngày gần đây
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
              <ShippingTable />
            </div>

            {/* Cột phải */}
            <aside className="space-y-8 h-full">
              <OrderRequests onViewDetail={setSelectedOrder} />
            </aside>
          </div>
          
          {/* Order Detail Panel */}
          <OrderDetailPanel 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />

          {/* Footer trang */}
          <footer className="text-center text-xs text-slate-500 mt-8">
            © 2025 VT Logistics — Demo UI Tailwind &amp; Chart.js
          </footer>
        </div>
      </main>
    </div>
  );
}
