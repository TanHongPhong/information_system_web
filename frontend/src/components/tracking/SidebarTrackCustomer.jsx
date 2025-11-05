// src/components/tracking/SidebarTrackCustomer.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import feather from "feather-icons";

export default function SidebarTrackCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    feather.replace();
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-20 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      {/* Logo block */}
      <div className="mt-1 mb-1 text-center select-none">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm hover:shadow-md transition-shadow"
          title="Dashboard"
        >
          <i data-feather="shield"></i>
        </button>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          6A logistics
        </div>
      </div>

      {/* Nav buttons - Customer Group */}
      <div className="flex flex-col items-center gap-4 flex-1">
        {/* Danh sách công ty */}
        <button
          onClick={() => navigate("/transport-companies")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/transport-companies")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Danh sách công ty"
        >
          <i data-feather="briefcase" className="w-6 h-6"></i>
        </button>

        {/* Theo dõi đơn hàng (ACTIVE) */}
        <button
          onClick={() => navigate("/order-tracking-customer")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/order-tracking-customer")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Theo dõi đơn hàng"
        >
          <i data-feather="map" className="w-6 h-6"></i>
        </button>

        {/* Lịch sử thanh toán */}
        <button
          onClick={() => navigate("/payment-history")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/payment-history")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Lịch sử thanh toán"
        >
          <i data-feather="file-text" className="w-6 h-6"></i>
        </button>
      </div>

      {/* Logout button at bottom */}
      <div className="mt-auto">
        <button
          onClick={() => {
            localStorage.removeItem("gd_user");
            localStorage.removeItem("role");
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("remember");
            navigate("/sign-in", { replace: true });
          }}
          className="w-10 h-10 rounded-xl grid place-items-center text-red-600 hover:bg-red-50 ring-1 ring-red-200 hover:ring-red-300 transition-colors"
          title="Đăng xuất"
        >
          <i data-feather="log-out" className="w-6 h-6"></i>
        </button>
      </div>
    </aside>
  );
}

