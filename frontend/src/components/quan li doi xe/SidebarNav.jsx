import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="w-[76px] bg-white border-r border-[#EAEBF0] flex flex-col items-center gap-[14px] py-4 flex-shrink-0 h-screen overflow-hidden"
      aria-label="Dashboard"
    >
      {/* Logo 6A logistics */}
      <button
        onClick={() => navigate("/dashboard")}
        className="w-11 h-11 rounded-[12px] bg-[#4A90E2] text-white grid place-items-center tracking-[.5px] shadow-[0_8px_20px_rgba(74,144,226,.25)] hover:shadow-[0_10px_26px_rgba(74,144,226,.35)] transition-shadow text-[8px] font-bold leading-tight"
        title="Dashboard"
      >
        6A
      </button>

      <ul className="flex flex-col gap-[18px] mt-1">
        {/* Nút 0 - Dashboard Supplier */}
        <li>
          <button
            onClick={() => navigate("/suplier")}
            className={`relative group w-11 h-11 rounded-[12px] grid place-items-center border transition-colors ${
              isActive("/suplier")
                ? "text-white bg-[#4A90E2] shadow-[0_10px_22px_rgba(74,144,226,.28)]"
                : "border-transparent text-[#99A3B0] hover:text-[#4A90E2] hover:bg-[#E9F2FF] hover:border-[#d7e7ff]"
            }`}
            title="Dashboard Supplier"
          >
            <svg
              className="w-[24px] h-[24px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>

            <span className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 bg-[#0B5BDA] text-white text-[13px] px-3 py-2 rounded-[10px] shadow-[0_10px_24px_rgba(2,6,23,.15),0_0_0_1px_rgba(59,130,246,.15)] whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] duration-200">
              Dashboard Supplier
              <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#0B5BDA] drop-shadow-[0_1px_1px_rgba(2,6,23,.12)]" />
            </span>
          </button>
        </li>

        {/* Nút 2 (active) */}
        <li>
          <button
            onClick={() => navigate("/quan-li-doi-xe")}
            className={`relative group w-11 h-11 rounded-[12px] grid place-items-center transition-colors ${
              isActive("/quan-li-doi-xe")
                ? "text-white bg-[#4A90E2] shadow-[0_10px_22px_rgba(74,144,226,.28)]"
                : "border border-transparent text-[#99A3B0] hover:text-[#4A90E2] hover:bg-[#E9F2FF] hover:border-[#d7e7ff]"
            }`}
            title="Theo dõi đội xe"
          >
            <svg
              className="w-[24px] h-[24px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17H5a1 1 0 0 1-1-1V6h11v5h3l3 3v2a1 1 0 0 1-1 1h-2" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>

            <span className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 bg-[#0B5BDA] text-white text-[13px] px-3 py-2 rounded-[10px] shadow-[0_10px_24px_rgba(2,6,23,.15),0_0_0_1px_rgba(59,130,246,.15)] whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] duration-200">
              Theo dõi đội xe
              <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#0B5BDA] drop-shadow-[0_1px_1px_rgba(2,6,23,.12)]" />
            </span>
          </button>
        </li>

        {/* Nút 3 */}
        <li>
          <button
            onClick={() => navigate("/order-tracking")}
            className={`relative group w-11 h-11 rounded-[12px] grid place-items-center transition-colors ${
              isActive("/order-tracking")
                ? "text-white bg-[#4A90E2] shadow-[0_10px_22px_rgba(74,144,226,.28)]"
                : "border border-transparent text-[#99A3B0] hover:text-[#4A90E2] hover:bg-[#E9F2FF] hover:border-[#d7e7ff]"
            }`}
            title="Theo dõi đơn hàng"
          >
            <svg
              className="w-[24px] h-[24px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>

            <span className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 bg-[#0B5BDA] text-white text-[13px] px-3 py-2 rounded-[10px] shadow-[0_10px_24px_rgba(2,6,23,.15),0_0_0_1px_rgba(59,130,246,.15)] whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] duration-200">
              Theo dõi đơn hàng
              <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#0B5BDA] drop-shadow-[0_1px_1px_rgba(2,6,23,.12)]" />
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
