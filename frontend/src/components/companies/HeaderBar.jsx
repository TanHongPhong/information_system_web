import React from "react";
import {
  Search, Filter, Plus, Bell, Archive, ChevronDown,
} from "lucide-react";

/** Ô tìm kiếm viền xanh gradient + glow */
function SearchField({ value, onChange, placeholder = "Tìm tên công ty, loại hàng..." }) {
  return (
    <div className="relative group">
      {/* lớp glow mờ bên ngoài */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 opacity-25 blur-md transition
                   group-focus-within:opacity-40"
        aria-hidden
      />
      {/* viền gradient mảnh */}
      <div className="relative rounded-full p-[2.5px] bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400">
        {/* nền trắng bên trong */}
        <div className="relative rounded-full bg-white">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-12 pl-10 pr-14 rounded-full border-0 outline-none bg-transparent placeholder:text-slate-400
                       focus:ring-0"
            placeholder={placeholder}
          />
          {/* nút filter nhỏ nằm trong ô */}
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg
                       bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50"
            title="Bộ lọc"
            type="button"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeaderBar({ keyword, onKeywordChange }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        <div className="flex-1 max-w-2xl mr-3 md:mr-6">
          <SearchField value={keyword} onChange={onKeywordChange} />
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
              <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
