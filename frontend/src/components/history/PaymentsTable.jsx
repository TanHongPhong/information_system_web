import { useEffect, useMemo } from "react";
import feather from "feather-icons";

export default function PaymentsTable({
  rows, page, pageSize, total,
  onPrev, onNext, canPrev, canNext,
  fmtVND,
}) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [rows]);

  const pageInfo = useMemo(() => {
    if (total === 0) return "Hiển thị 0–0 / 0 giao dịch";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `Hiển thị ${start}–${end} / ${total} giao dịch`;
  }, [page, pageSize, total]);

  const methodIcon = (m) => {
    const icon = m.includes("Thẻ") ? "credit-card" : m.includes("Ví") ? "smartphone" : "banknote";
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-700">
        <i data-feather={icon} className="w-4 h-4" />{m}
      </span>
    );
  };
  const badge = (status) => {
    const map = {
      Paid: "bg-green-50 text-green-700 ring-1 ring-green-200",
      Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      Refunded: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
  };
  const companyChip = (name) => {
    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-bold">{initials}</span>
        <span className="text-slate-700">{name}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-blue-800">
            <tr className="text-left">
              <th className="font-semibold px-5 md:px-6 py-3">Mã đơn</th>
              <th className="font-semibold px-5 md:px-6 py-3">Ngày thanh toán</th>
              <th className="font-semibold px-5 md:px-6 py-3">Phương thức</th>
              <th className="font-semibold px-5 md:px-6 py-3">Số tiền</th>
              <th className="font-semibold px-5 md:px-6 py-3">Trạng thái</th>
              <th className="font-semibold px-5 md:px-6 py-3">Công ty</th>
              <th className="font-semibold px-5 md:px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-5 md:px-6 py-3 text-slate-800 font-medium">{r.id}</td>
                <td className="px-5 md:px-6 py-3 text-slate-700">{r.date}</td>
                <td className="px-5 md:px-6 py-3">{methodIcon(r.method)}</td>
                <td className="px-5 md:px-6 py-3 text-slate-900 font-semibold">{fmtVND(r.amount)}</td>
                <td className="px-5 md:px-6 py-3">{badge(r.status)}</td>
                <td className="px-5 md:px-6 py-3">{companyChip(r.company)}</td>
                <td className="px-5 md:px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Xem hóa đơn"><i data-feather="file" className="w-4 h-4" /></button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Tải biên lai"><i data-feather="download" className="w-4 h-4" /></button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="More"><i data-feather="more-horizontal" className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Không có giao dịch phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
        <p className="text-sm text-slate-600">{pageInfo}</p>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} disabled={!canPrev} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50">Trước</button>
          <button onClick={onNext} disabled={!canNext} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  );
}
