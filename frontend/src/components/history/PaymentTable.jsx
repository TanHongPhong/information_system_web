// src/components/history/PaymentTable.jsx
import React from "react";

// ==== Inline SVG icons (không cần react-feather) ====
const Icon = ({ children, size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const CreditCardIcon = (p) => (
  <Icon {...p}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </Icon>
);

const SmartphoneIcon = (p) => (
  <Icon {...p}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </Icon>
);

const DollarIcon = (p) => (
  <Icon {...p}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

const FileIcon = (p) => (
  <Icon {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Icon>
);

const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

const MoreHorizontalIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </Icon>
);

// ==== UI helpers trong file ====
const badge = (s) => {
  const map = {
    Paid: "bg-green-50 text-green-700 ring-1 ring-green-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Refunded: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
};

const Method = ({ text }) => {
  const t = text.toLowerCase();
  const Ico =
    t.includes("thẻ") || t.includes("visa") ? CreditCardIcon : t.includes("ví") ? SmartphoneIcon : DollarIcon;
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-700">
      <Ico /> {text}
    </span>
  );
};

const CompanyChip = ({ name }) => {
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
};

// ==== Main table ====
export function PaymentTable({ rows, page, pageSize, onPrev, onNext, totalCount, fmt }) {
  const start = rows.length ? (page - 1) * pageSize + 1 : 0;
  const end = (page - 1) * pageSize + rows.length;

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
                <td className="px-5 md:px-6 py-3 font-medium">{r.id}</td>
                <td className="px-5 md:px-6 py-3">{r.date}</td>
                <td className="px-5 md:px-6 py-3">
                  <Method text={r.method} />
                </td>
                <td className="px-5 md:px-6 py-3 font-semibold">{fmt(r.amount)}</td>
                <td className="px-5 md:px-6 py-3">{badge(r.status)}</td>
                <td className="px-5 md:px-6 py-3">
                  <CompanyChip name={r.company} />
                </td>
                <td className="px-5 md:px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Invoice">
                      <FileIcon />
                    </button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="Download">
                      <DownloadIcon />
                    </button>
                    <button className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" title="More">
                      <MoreHorizontalIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
        <p className="text-sm text-slate-600">
          Hiển thị {start}–{end} / {totalCount} giao dịch
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Trước 
          </button>
          <button onClick={onNext} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
