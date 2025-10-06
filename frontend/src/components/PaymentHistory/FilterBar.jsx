import React from "react";

export default function FilterBar({
  q, setQ,
  fromDate, setFromDate,
  toDateStr, setToDateStr,
  company, setCompany,
  status, setStatus,
  sortBy, setSortBy,
  onReset,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-soft">
      <div className="grid lg:grid-cols-12 gap-3 md:gap-4">
        <div className="lg:col-span-3">
          <label className="text-sm text-slate-600">Tìm kiếm</label>
          <div className="mt-1 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Mã đơn / công ty / số tiền…"
              className="w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 pl-9"
            />
            <i data-feather="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Từ ngày</label>
            <input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Đến ngày</label>
            <input
              value={toDateStr}
              onChange={(e) => setToDateStr(e.target.value)}
              type="date"
              className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Công ty</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option>Gemadept</option>
              <option>Thái Bình Dương Logistics</option>
              <option>DHL</option>
              <option>Transimex</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            >
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="date_desc">Ngày ↓</option>
              <option value="date_asc">Ngày ↑</option>
              <option value="amount_desc">Số tiền ↓</option>
              <option value="amount_asc">Số tiền ↑</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onReset}
              className="w-full h-[42px] rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
