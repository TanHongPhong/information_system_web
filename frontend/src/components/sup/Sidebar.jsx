import React from "react";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
      {/* Logo */}
      <div className="mt-1 mb-1 text-center select-none">
        <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
          <i data-feather="shield" className="w-5 h-5"></i>
        </span>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          6A
        </div>
      </div>

      {/* Nav icons */}
      <div className="flex flex-col items-center gap-4">
        {/* Active */}
        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200"
          title="Trang chủ"
        >
          <i data-feather="home" className="w-5 h-5"></i>
        </button>

        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Quản lý xe"
        >
          <i data-feather="truck" className="w-5 h-5"></i>
        </button>

        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Theo dõi đơn"
        >
          <i data-feather="map" className="w-5 h-5"></i>
        </button>

        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Người dùng"
        >
          <i data-feather="user" className="w-5 h-5"></i>
        </button>

        <button
          className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          title="Cài đặt"
        >
          <i data-feather="settings" className="w-5 h-5"></i>
        </button>
      </div>
    </aside>
  );
}
