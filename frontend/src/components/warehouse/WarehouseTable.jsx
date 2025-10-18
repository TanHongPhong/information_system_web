function StatusBadge({ status }) {
  const map = {
    "Đã xuất kho": "bg-red-50 text-red-600 ring-red-200",
    "Lưu kho": "bg-emerald-50 text-emerald-600 ring-emerald-200",
    "Đang vận chuyển": "bg-blue-50 text-blue-600 ring-blue-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1 min-w-[112px] ${cls}`}>
      {status}
    </span>
  );
}

export default function WarehouseTable({ rows, onExport }) {
  const head = ["MÃ ĐƠN","LOẠI","TRẠNG THÁI","KHÁCH HÀNG","ĐIỂM ĐI","ĐIỂM ĐẾN","PALLETS","KHỐI LƯỢNG","DOOR","XE/CONTAINER","NGÀY"];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
      <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-[#8CC2FF] via-[#6AA8FF] to-[#2A60FF] text-white flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-xl bg-white/20 grid place-items-center">📦</div>
          <div>
            <div className="opacity-90">Kho trung tâm</div>
            <div className="font-semibold">Gemadept Logistics</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2">⭳ Import</button>
          <button onClick={onExport} className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2">⭱ Export</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {head.map(h => (
                <th key={h} className="text-left text-[11px] tracking-wider font-semibold uppercase px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={11} className="px-5 py-6 text-center text-slate-500">Không có bản ghi phù hợp.</td></tr>
            )}
            {rows.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3 font-medium text-slate-900"><span className="inline-block max-w-[140px] truncate">{o.id}</span></td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 ${
                    o.type==='in' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                  }`}>{o.type==='in' ? 'Nhập':'Xuất'}</span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3">{o.customer}</td>
                <td className="px-5 py-3">{o.from}</td>
                <td className="px-5 py-3">{o.to}</td>
                <td className="px-5 py-3">{o.pallets}</td>
                <td className="px-5 py-3">{o.weight.toLocaleString()} {o.unit}</td>
                <td className="px-5 py-3">{o.docks}</td>
                <td className="px-5 py-3">{o.carrier}</td>
                <td className="px-5 py-3 text-right pr-5 text-slate-600">{o.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
