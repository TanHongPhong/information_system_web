// components/HeaderBar.jsx
import React from "react";
import { Search, Filter, Plus, Bell, Archive, ChevronDown } from "lucide-react";

function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="group relative">
      <div className="rounded-full p-[2.5px] bg-gradient-to-r from-sky-100 via-sky-50 to-sky-100 shadow-[0_2px_10px_rgba(59,130,246,.10)]">
        <div className="relative rounded-full bg-white border border-sky-100">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 pl-10 pr-14 rounded-full bg-transparent outline-none border-0 placeholder:text-slate-400 text-[15px]"
          />
          <button
            type="button"
            title="Bộ lọc"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
          >
            <Filter className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeaderBar({ keyword, onKeywordChange, placeholder }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        <div className="flex-1 max-w-2xl mr-3 md:mr-6">
          <SearchField value={keyword} onChange={onKeywordChange} placeholder={placeholder} />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
            <Plus className="w-4 h-4" />
          </button>
          <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
            <Archive className="w-4 h-4" />
          </button>
          <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
            <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[13px] font-semibold">Harsh Vani</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
