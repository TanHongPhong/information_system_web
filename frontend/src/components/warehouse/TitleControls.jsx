import { useState, useRef, useEffect } from "react";

export default function TitleControls({
  onReload,
  onStatusFilter,
  onDateFilter,
  statusFilter,
  dateFilter
}) {

  return (
    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Đơn hàng tại kho</h2>
        <p className="text-xs text-slate-500 mt-1">Theo dõi đơn hàng đã tới kho và đã xuất kho giao cho khách hàng. Dữ liệu xuất ra để WMS quản lý.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <select
          value={statusFilter || "all"}
          onChange={(e) => onStatusFilter && onStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="STORED">Đã tới kho</option>
          <option value="SHIPPED">Đã xuất kho</option>
        </select>

        {/* Date filter */}
        <select
          value={dateFilter || "all"}
          onChange={(e) => onDateFilter && onDateFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>


        <button
          onClick={onReload}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
        >
          ↻ <span>Tải lại</span>
        </button>
      </div>
    </div>
  );
}
