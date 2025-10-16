import { useEffect } from "react";
import feather from "feather-icons";

export default function KPISection({ total, count, avg, refunded, thisMonth }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Tổng thanh toán</p>
          <i data-feather="credit-card" className="w-5 h-5 text-blue-600" />
        </div>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{total}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">{thisMonth} trong tháng này</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Số giao dịch</p>
          <i data-feather="list" className="w-5 h-5 text-blue-600" />
        </div>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{count}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Đã lọc</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Giá trị trung bình</p>
          <i data-feather="bar-chart-2" className="w-5 h-5 text-blue-600" />
        </div>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{avg}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Theo danh sách hiện tại</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Hoàn tiền</p>
          <i data-feather="rotate-ccw" className="w-5 h-5 text-blue-600" />
        </div>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-rose-600">{refunded}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Giá trị hoàn trả</p>
      </div>
    </div>
  );
}
