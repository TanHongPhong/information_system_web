// src/components/theo doi don hang/SidebarTrack.jsx
import React from "react";
import {
  IconShield,
  IconHome,
  IconTruck,
  IconMap,
  IconUser,
  IconSettings,
} from "./IconsFeather";

export default function SidebarTrack() {
  return (
    <aside className="w-20 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      {/* Logo block */}
      <div className="mt-1 mb-1 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
          <IconShield className="w-[22px] h-[22px]" />
        </span>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          6A
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex flex-col items-center gap-4">
        {/* Trang chủ */}
        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Trang chủ"
        >
          <IconHome className="w-[20px] h-[20px]" />
        </button>

        {/* Quản lý xe */}
        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Quản lý xe"
        >
          <IconTruck className="w-[20px] h-[20px]" />
        </button>

        {/* Theo dõi đơn (ACTIVE) */}
        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200"
          title="Theo dõi đơn"
        >
          <IconMap className="w-[20px] h-[20px]" />
        </button>

        {/* Dưới */}
        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Người dùng"
        >
          <IconUser className="w-[20px] h-[20px]" />
        </button>

        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Cài đặt"
        >
          <IconSettings className="w-[20px] h-[20px]" />
        </button>
      </div>
    </aside>
  );
}
