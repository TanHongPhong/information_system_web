import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import feather from "feather-icons";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    feather.replace();
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
      {/* Logo */}
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

      {/* Nav icons - Warehouse Group */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => navigate("/warehouse")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/warehouse")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Quản lý kho hàng"
        >
          <i data-feather="package" className="w-6 h-6"></i>
        </button>
      </div>
    </aside>
  );
}

