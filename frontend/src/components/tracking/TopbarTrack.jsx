// src/components/theo doi don hang/TopbarTrack.jsx
import React from "react";
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconBell,
  IconArchive,
  IconChevronDown,
} from "./IconsFeather";

export default function TopbarTrack() {
  return (
    <header
      className="h-[64px] flex-shrink-0 border-b bg-white/95 backdrop-blur bg-gradient-to-l from-blue-900 via-sky-200 to-white flex items-center"
    >
      <div className="w-full px-3 md:px-5 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 max-w-2xl mr-3 md:mr-6">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-[20px] h-[20px]" />
              <input
                className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none text-[14px] placeholder:text-slate-400 bg-white"
                placeholder="Tìm kiếm đơn hàng, tuyến đường..."
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 bg-white"
                title="Filter"
              >
                <IconFilter className="w-[18px] h-[18px] text-slate-600" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50"
              title="New"
            >
              <IconPlus className="w-[18px] h-[18px]" />
            </button>

            <button
              className="h-9 w-9 rounded-lg grid place-items-center bg-blue-50 border border-slate-200 hover:bg-slate-50 text-slate-800"
              title="Notifications"
            >
              <IconBell className="w-[18px] h-[18px]" />
            </button>

            <button
              className="h-9 w-9 rounded-lg grid place-items-center bg-blue-50 border border-slate-200 hover:bg-slate-50 text-slate-800"
              title="Archive"
            >
              <IconArchive className="w-[18px] h-[18px]" />
            </button>

            {/* User dropdown */}
            <button
              type="button"
              className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
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
              <IconChevronDown className="w-[18px] h-[18px] text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
