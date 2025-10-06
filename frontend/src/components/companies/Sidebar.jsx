import React from "react";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4">
      <div className="flex flex-col items-center gap-4 text-blue-600">
        <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Trang chủ" aria-label="Trang chủ" type="button">
          <i data-feather="home" aria-hidden="true" />
        </button>
        <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Theo dõi vị trí" aria-label="Theo dõi vị trí" type="button">
          <i data-feather="map" aria-hidden="true" />
        </button>
        <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Lịch sử giao dịch" aria-label="Lịch sử giao dịch" type="button">
          <i data-feather="file-text" aria-hidden="true" />
        </button>
        <button className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Thông báo" aria-label="Thông báo" type="button">
          <i data-feather="bell" aria-hidden="true" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Người dùng" aria-label="Người dùng" type="button">
          <i data-feather="user" aria-hidden="true" />
        </button>
        <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" title="Cài đặt" aria-label="Cài đặt" type="button">
          <i data-feather="settings" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
