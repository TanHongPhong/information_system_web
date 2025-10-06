import React from "react";

function MethodIcon({ method }) {
  const icon = method.includes("Thẻ")
    ? "credit-card"
    : method.includes("Ví")
    ? "smartphone"
    : "banknote";
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-700">
      <i data-feather={icon} className="w-4 h-4" />
      {method}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Paid: "bg-green-50 text-green-700 ring-1 ring-green-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Refunded: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
}

function CompanyChip({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-bold">
        {initials}
      </span>
      <span className="text-slate-700">{name}</span>
    </div>
  );
}

export default function HistoryTable({
  rows,              // pageRows
  fmtVND,
  page, setPage,
  maxPage,
  filteredLength,
  pageSize,
}) {
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
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-5 md:px-6 py-3 text-slate-800 font-medium">{r.id}</td>
                <td className="px-5 md:px-6 py-3 text-slate-700">{r.date}</td>
                <td className="px-5 md:px-6 py-3">
                  <MethodIcon method={r.method} />
                </td>
                <td className="px-5 md:px-6 py-3 text-slate-900 font-semibold">{fmtVND(r.amount)}</td>
                <td className="px-5 md:px-6 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 md:px-6 py-3">
                  <CompanyChip name={r.company} />
                </td>
                <td className="px-5 md:px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Xem hóa đơn">
                      <i data-feather="file" className="w-4 h-4" />
                    </button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Tải biên lai">
                      <i data-feather="download" className="w-4 h-4" />
                    </button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="More">
                      <i data-feather="more-horizontal" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-5 md:px-6 py-6 text-center text-slate-500" colSpan={7}>
                  Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc khoảng thời gian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
        <p className="text-sm text-slate-600">
          Hiển thị {filteredLength ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, filteredLength)} / {filteredLength} giao dịch
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
