// src/components/history/FilterBar.jsx
import { useEffect, useState, useMemo } from "react";

export function FilterBar({ onChange, rows = [] }) {
  const [state, setState] = useState({ q:"", company:"", status:"", sortBy:"date_desc" });
  
  useEffect(() => { onChange?.(state); }, [state, onChange]);
  
  const set = (k) => (e) => setState((s) => ({ ...s, [k]: e.target.value }));

  // Lấy danh sách công ty từ dữ liệu thực tế
  const companies = useMemo(() => {
    const uniqueCompanies = [...new Set(rows.map(r => r.company).filter(Boolean))].sort();
    return uniqueCompanies;
  }, [rows]);

  const hasActiveFilters = useMemo(() => {
    return !!(state.q || state.company || state.status || state.sortBy !== "date_desc");
  }, [state]);

  const handleReset = () => {
    setState({ q:"", company:"", status:"", sortBy:"date_desc" });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-soft">
      <div className="grid lg:grid-cols-12 gap-3 md:gap-4">
        {/* Tìm kiếm */}
        <div className="lg:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tìm kiếm</label>
          <input 
            value={state.q} 
            onChange={set("q")} 
            placeholder="Mã đơn, công ty, số tiền…"
            className="w-full h-[42px] rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-3 text-sm transition-colors"
          />
        </div>

        {/* Công ty và Trạng thái */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Công ty</label>
            <select 
              value={state.company} 
              onChange={set("company")}
              className="w-full h-[42px] rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-3 text-sm bg-white transition-colors"
            >
              <option value="">Tất cả</option>
              {companies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
            <select 
              value={state.status} 
              onChange={set("status")}
              className="w-full h-[42px] rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-3 text-sm bg-white transition-colors"
            >
              <option value="">Tất cả</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Pending">Đang chờ</option>
              <option value="Refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        {/* Sắp xếp và Nút xóa lọc */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sắp xếp</label>
            <select 
              value={state.sortBy} 
              onChange={set("sortBy")}
              className="w-full h-[42px] rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-3 text-sm bg-white transition-colors"
            >
              <option value="date_desc">Ngày mới nhất</option>
              <option value="date_asc">Ngày cũ nhất</option>
              <option value="amount_desc">Số tiền cao nhất</option>
              <option value="amount_asc">Số tiền thấp nhất</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className={`w-full h-[42px] rounded-xl border transition-colors font-medium text-sm ${
                hasActiveFilters
                  ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400"
                  : "border-slate-300 bg-slate-50 text-slate-400 cursor-not-allowed"
              }`}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
