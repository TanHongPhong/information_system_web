import React from "react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        <div className="flex-1 max-w-2xl mr-3 md:mr-6">
          <div className="relative">
            <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Tìm giao dịch, mã đơn, số tiền…" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
              <i data-feather="filter" className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New"><i data-feather="plus" className="w-4 h-4" /></button>
          <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications"><i data-feather="bell" className="w-4 h-4" /></button>
          <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive"><i data-feather="archive" className="w-4 h-4" /></button>
          <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
            <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[13px] font-semibold">Harsh Vani</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
            </div>
            <i data-feather="chevron-down" className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
