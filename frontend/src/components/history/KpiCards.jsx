// src/components/payments/KpiCards.jsx
export function KpiCards({ total, count, avg, refunded, thisMonth, fmt }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Total paid</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{fmt(total)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">{fmt(thisMonth)} this month</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Transactions</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{count}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Current list</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Average value</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold">{fmt(avg || 0)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Based on filters</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
        <p className="text-sm text-slate-500">Refunded</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold text-rose-600">{fmt(refunded)}</p>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Total refunded</p>
      </div>
    </div>
  );
}
