// src/pages/PaymentHistory.jsx
import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

/** ==== CHỈNH Ở ĐÂY NẾU CẦN ==== */
const SIDEBAR_W = 256; // px — nếu Sidebar w-64 => 256px; w-72 => 288px

// ===== Helpers =====
const fmtVND = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const toDate = (dmy) => {
  if (!dmy) return new Date("");
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, m - 1, d);
};

// ===== Demo data =====
const PAYMENTS = [
  {
    id: "#322138483848",
    date: "15/10/2025",
    amount: 10000000,
    company: "Gemadept",
    method: "Chuyển khoản",
    status: "Paid",
  },
  {
    id: "#2458745233343",
    date: "15/10/2025",
    amount: 2500000,
    company: "Thái Bình Dương Logistics",
    method: "Thẻ VISA",
    status: "Pending",
  },
  {
    id: "#998877665544",
    date: "14/10/2025",
    amount: 4800000,
    company: "DHL",
    method: "Ví điện tử",
    status: "Paid",
  },
  {
    id: "#445566778899",
    date: "10/10/2025",
    amount: 10000000,
    company: "Gemadept",
    method: "Chuyển khoản",
    status: "Refunded",
  },
  {
    id: "#112233445566",
    date: "08/10/2025",
    amount: 7200000,
    company: "Transimex",
    method: "Thẻ VISA",
    status: "Paid",
  },
  {
    id: "#556677889900",
    date: "03/10/2025",
    amount: 3500000,
    company: "DHL",
    method: "Ví điện tử",
    status: "Paid",
  },
  {
    id: "#123450987654",
    date: "29/09/2025",
    amount: 15000000,
    company: "Gemadept",
    method: "Chuyển khoản",
    status: "Paid",
  },
  {
    id: "#777888999000",
    date: "18/09/2025",
    amount: 2000000,
    company: "Thái Bình Dương Logistics",
    method: "Thẻ VISA",
    status: "Refunded",
  },
  {
    id: "#333222111000",
    date: "02/09/2025",
    amount: 5600000,
    company: "Transimex",
    method: "Chuyển khoản",
    status: "Pending",
  },
  {
    id: "#111222333444",
    date: "25/08/2025",
    amount: 9900000,
    company: "DHL",
    method: "Ví điện tử",
    status: "Paid",
  },
  {
    id: "#222333444555",
    date: "10/08/2025",
    amount: 8700000,
    company: "Gemadept",
    method: "Thẻ VISA",
    status: "Paid",
  },
  {
    id: "#666555444333",
    date: "05/08/2025",
    amount: 4200000,
    company: "DHL",
    method: "Chuyển khoản",
    status: "Paid",
  },
];

// ===== Inline subcomponents =====
function HeaderGradient({ title = "Payment History" }) {
  return (
    <div className="px-4 md:px-6 pt-4">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow">
        <h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>
      </div>
    </div>
  );
}

function KpiCards({ total, count, avg, refunded, thisMonth }) {
  const items = [
    { label: "Tổng giá trị", value: fmtVND(total) },
    { label: "Số giao dịch", value: count },
    { label: "Trung bình", value: fmtVND(avg) },
    { label: "Hoàn tiền", value: fmtVND(refunded) },
    { label: "Tháng này", value: fmtVND(thisMonth) },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow"
        >
          <div className="text-slate-500 text-sm">{it.label}</div>
          <div className="text-xl font-bold mt-1">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filters, setFilters, companies }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow">
      <div className="grid md:grid-cols-6 gap-3">
        <input
          className="md:col-span-2 border rounded-xl p-2"
          placeholder="Tìm (ID / công ty / số tiền)"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <input
          type="date"
          className="border rounded-xl p-2"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          className="border rounded-xl p-2"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <select
          className="border rounded-xl p-2"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        >
          <option value="">Tất cả công ty</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            className="border rounded-xl p-2 w-full"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Refunded</option>
          </select>
          <select
            className="border rounded-xl p-2 w-full"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="date_desc">Mới nhất</option>
            <option value="date_asc">Cũ nhất</option>
            <option value="amount_desc">Số tiền ↓</option>
            <option value="amount_asc">Số tiền ↑</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PaymentTable({ rows, page, pageSize, totalCount, onPrev, onNext }) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3">Mã GD</th>
            <th className="text-left p-3">Ngày</th>
            <th className="text-right p-3">Số tiền</th>
            <th className="text-left p-3">Công ty</th>
            <th className="text-left p-3">Phương thức</th>
            <th className="text-left p-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3 font-medium">{r.id}</td>
              <td className="p-3">{r.date}</td>
              <td className="p-3 text-right">{fmtVND(r.amount)}</td>
              <td className="p-3">{r.company}</td>
              <td className="p-3">{r.method}</td>
              <td className="p-3">
                <span
                  className={
                    "px-2 py-1 rounded-lg text-xs " +
                    (r.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : r.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-700")
                  }
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-slate-500">
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-3 border-t text-sm">
        <div>
          Hiển thị <b>{rows.length ? start : 0}</b>–
          <b>{rows.length ? end : 0}</b> / <b>{totalCount}</b>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
            disabled={start <= 1}
          >
            Trước
          </button>
          <button
            onClick={onNext}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
            disabled={end >= totalCount}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Page =====
export default function PaymentHistory() {
  const [filters, setFilters] = useState({
    q: "",
    from: "",
    to: "",
    company: "",
    status: "",
    sortBy: "date_desc",
  });
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const companies = useMemo(
    () => Array.from(new Set(PAYMENTS.map((p) => p.company))),
    []
  );

  const filtered = useMemo(() => {
    let arr = [...PAYMENTS];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const qNum = q.replace(/[^\d]/g, "");
      arr = arr.filter(
        (x) =>
          x.id.toLowerCase().includes(q) ||
          x.company.toLowerCase().includes(q) ||
          String(x.amount).includes(qNum)
      );
    }
    if (filters.from)
      arr = arr.filter((x) => toDate(x.date) >= new Date(filters.from));
    if (filters.to)
      arr = arr.filter((x) => toDate(x.date) <= new Date(filters.to));
    if (filters.company) arr = arr.filter((x) => x.company === filters.company);
    if (filters.status) arr = arr.filter((x) => x.status === filters.status);

    arr.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc":
          return toDate(a.date) - toDate(b.date);
        case "date_desc":
          return toDate(b.date) - toDate(a.date);
        case "amount_asc":
          return a.amount - b.amount;
        case "amount_desc":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });
    return arr;
  }, [filters]);

  const kpi = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.amount, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const refunded = filtered
      .filter((x) => x.status === "Refunded")
      .reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonth = filtered
      .filter((x) => {
        const d = toDate(x.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, x) => s + x.amount, 0);
    return { total, count, avg, refunded, thisMonth };
  }, [filtered]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  return (
    <>
      {/* Sidebar có thể fixed; phần content bên phải luôn chừa chỗ theo SIDEBAR_W */}
      <Sidebar active="payment-history" />

      <div
        className="min-h-screen bg-slate-50"
        style={{ paddingLeft: SIDEBAR_W }} // tránh sidebar đè nội dung
      >
        <Topbar />

        <HeaderGradient />

        <div className="px-4 md:px-6 space-y-6 pb-10 max-w-7xl mx-auto">
          <KpiCards
            total={kpi.total}
            count={kpi.count}
            avg={kpi.avg}
            refunded={kpi.refunded}
            thisMonth={kpi.thisMonth}
          />

          <FilterBar
            filters={filters}
            setFilters={(f) => {
              setFilters(f);
              setPage(1);
            }}
            companies={companies}
          />

          <PaymentTable
            rows={pageRows}
            page={page}
            pageSize={pageSize}
            totalCount={filtered.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => (end < filtered.length ? p + 1 : p))}
          />
        </div>
      </div>
    </>
  );
}
