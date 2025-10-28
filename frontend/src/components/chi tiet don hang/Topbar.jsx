import React, { useEffect } from "react";
import feather from "feather-icons";

export default function Topbar() {
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <header
      className="fixed top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/65 bg-gradient-to-l from-blue-900 via-sky-200 to-white shadow-sm"
      style={{
        marginLeft: "5rem", // 80px = sidebar
        width: "calc(100% - 5rem)",
      }}
    >
      <div className="px-3 md:px-5 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex-1 max-w-2xl mr-3 md:mr-6">
            <div className="relative">
              <i
                data-feather="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4"
              ></i>
              <input
                className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-slate-800 placeholder-slate-400"
                placeholder="Tìm giao dịch, mã đơn, số tiền…"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                title="Filter"
              >
                <i
                  data-feather="filter"
                  className="w-4 h-4 text-slate-500"
                ></i>
              </button>
            </div>
          </div>

          {/* Action buttons + user */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50 transition-all"
              title="New"
            >
              <i data-feather="plus" className="w-4 h-4"></i>
            </button>

            <button
              className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50 transition-all"
              title="Notifications"
            >
              <i data-feather="bell" className="w-4 h-4"></i>
            </button>

            <button
              className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50 transition-all"
              title="Archive"
            >
              <i data-feather="archive" className="w-4 h-4"></i>
            </button>

            <button
              type="button"
              className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-all"
            >
              <img
                src="https://i.pravatar.cc/40?img=8"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[13px] font-semibold">Harsh Vani</div>
                <div className="text-[11px] text-slate-500 -mt-0.5">
                  Deportation Manager
                </div>
              </div>
              <i
                data-feather="chevron-down"
                className="text-slate-400 w-4 h-4"
              ></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
