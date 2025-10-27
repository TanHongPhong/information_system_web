// src/components/payments/KpiCards.jsx
export function KpiCards({ total, count, avg, refunded, thisMonth, fmt }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Tổng thanh toán</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{fmt(total)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">{fmt(thisMonth)} trong tháng này</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Số giao dịch</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{count}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Đã lọc</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Giá trị trung bình</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{fmt(avg || 0)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Theo danh sách hiện tại</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Hoàn tiền</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-rose-600">{fmt(refunded)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Giá trị hoàn trả</p>
      </div>
    </div>
  );
}
