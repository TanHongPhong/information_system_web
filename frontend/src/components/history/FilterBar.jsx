// src/components/payments/FilterBar.jsx
import { useEffect, useState } from "react";

export function FilterBar({ onChange }) {
  const [state, setState] = useState({ q:"", from:"", to:"", company:"", status:"", sortBy:"date_desc" });
  useEffect(() => { onChange?.(state); }, [state, onChange]);
  const set = (k) => (e) => setState((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-soft">
      <div className="grid lg:grid-cols-12 gap-3 md:gap-4">
        <div className="lg:col-span-3">
          <label className="text-sm text-slate-600">Tìm kiếm</label>
          <input value={state.q} onChange={set("q")} placeholder="Order / company / amount…"
                 className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 pl-3"/>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Từ ngày</label>
            <input type="date" value={state.from} onChange={set("from")}
                   className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="text-sm text-slate-600">Đến ngày</label>
            <input type="date" value={state.to} onChange={set("to")}
                   className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"/>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Công ty</label>
            <select value={state.company} onChange={set("company")}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <option value="">All</option>
              <option>Gemadept</option>
              <option>Thái Bình Dương Logistics</option>
              <option>DHL</option>
              <option>Transimex</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Trạng thái</label>
            <select value={state.status} onChange={set("status")}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <option value="">Tất cả</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Sắp xếp</label>
            <select value={state.sortBy} onChange={set("sortBy")}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <option value="date_desc">Ngày ↓</option>
              <option value="date_asc">Ngày ↑</option>
              <option value="amount_desc">Số tiền ↓</option>
              <option value="amount_asc">Số tiền ↑</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full h-[42px] rounded-xl border border-slate-300 hover:bg-slate-50"
              onClick={() => setState({ q:"", from:"", to:"", company:"", status:"", sortBy:"date_desc" })}
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
