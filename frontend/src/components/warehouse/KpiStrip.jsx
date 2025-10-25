export default function KpiStrip({ baseRows }) {
  const inboundToday = 34;       // demo
  const outboundToday = 29;      // demo
  const inTransit = baseRows.filter(d => d.status === "Đang vận chuyển").length;
  const capacityUsed = 72;

  const Stat = ({ icon, label, value, tone }) => {
    const toneMap = { neutral:"bg-slate-50", in:"bg-blue-50", out:"bg-indigo-50" };
    return (
      <div className={`rounded-2xl p-4 border border-slate-200 ${toneMap[tone]||""}`}>
        <div className="flex items-center gap-2 text-sm text-slate-500">{icon} {label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-5 gap-3">
      <Stat icon="📦" label="Đã nhập hôm nay" value={inboundToday} tone="in" />
      <Stat icon="🚚" label="Đã xuất hôm nay" value={outboundToday} tone="out" />
      <Stat icon="🚛" label="Đang vận chuyển" value={inTransit} tone="neutral" />
      <div className="rounded-2xl p-4 border border-slate-200 bg-white md:col-span-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">📈 Công suất kho</div>
        <div className="mt-2">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${capacityUsed}%` }} />
          </div>
        </div>
        <div className="text-[12px] text-slate-500 mt-1">{capacityUsed}% sử dụng • 1.450/2.000 pallets</div>
      </div>
    </div>
  );
}
