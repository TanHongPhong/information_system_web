import React from "react";

export default function SidebarNav() {
  return (
    <nav
      className="w-[76px] bg-white border-r border-[#EAEBF0] flex flex-col items-center gap-[14px] py-4 flex-shrink-0 h-screen overflow-hidden"
      aria-label="Dashboard"
    >
      {/* Logo VT */}
      <div
        className="w-11 h-11 rounded-[12px] bg-[#4A90E2] text-white grid place-items-center tracking-[.5px] shadow-[0_8px_20px_rgba(74,144,226,.25)]"
        style={{ fontWeight: 800 }}
      >
        VT
      </div>

      <ul className="flex flex-col gap-[18px] mt-1">
        {/* Nút 1 */}
        <li>
          <button
            className="relative group w-11 h-11 rounded-[12px] grid place-items-center border border-transparent text-[#99A3B0] hover:text-[#4A90E2] hover:bg-[#E9F2FF] hover:border-[#d7e7ff] transition-colors"
            title="Check thông tin đơn hàng"
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
              <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
              <path d="M14 2v5h5" />
              <path d="M9 14l2 2 4-4" />
            </svg>

            {/* tooltip */}
            <span className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 bg-[#0B5BDA] text-white text-[13px] px-3 py-2 rounded-[10px] shadow-[0_10px_24px_rgba(2,6,23,.15),0_0_0_1px_rgba(59,130,246,.15)] whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] duration-200">
              Check thông tin đơn hàng
              <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#0B5BDA] drop-shadow-[0_1px_1px_rgba(2,6,23,.12)]" />
            </span>
          </button>
        </li>

        {/* Nút 2 (active) */}
        <li>
          <button
            className="relative group w-11 h-11 rounded-[12px] grid place-items-center text-white bg-[#4A90E2] shadow-[0_10px_22px_rgba(74,144,226,.28)]"
            title="Trạng thái đội xe"
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
              Trạng thái đội xe
              <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#0B5BDA] drop-shadow-[0_1px_1px_rgba(2,6,23,.12)]" />
            </span>
          </button>
        </li>

        {/* Nút 3 */}
        <li>
          <button
            className="relative group w-11 h-11 rounded-[12px] grid place-items-center border border-transparent text-[#99A3B0] hover:text-[#4A90E2] hover:bg-[#E9F2FF] hover:border-[#d7e7ff] transition-colors"
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
