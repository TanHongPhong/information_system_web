// src/pages/PaymentHistory.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import { KpiCards } from "../components/history/KpiCards.jsx";
import { FilterBar } from "../components/history/FilterBar.jsx";
import { PaymentTable } from "../components/history/PaymentTable.jsx";
import api from "../lib/axios";

// ==== Helpers (inline, không cần helpers.js) ====
const fmtVND = (v) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const toDate = (dmy) => {
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, m - 1, d);
};

// Map backend -> table row
function mapTxnToRow(t) {
  const statusMap = {
    SUCCESS: "Paid",
    PENDING: "Pending",
    FAILED: "Pending",
    CANCELLED: "Refunded",
    REFUNDED: "Refunded",
  };
  const dt = t.paid_at || t.created_at;
  const d = dt ? new Date(dt) : new Date();
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const methodStr = t.payment_method || "Chuyển khoản";
  return {
    id: `#${t.order_id ?? t.transaction_id}`,
    date: dateStr,
    amount: Number(t.amount) || 0,
    company: t.company_name || "—",
    method: methodStr,
    status: statusMap[t.payment_status] || "Paid",
  };
}

export default function PaymentHistory() {
  const [filters, setFilters] = useState({ q:"", from:"", to:"", company:"", status:"", sortBy:"date_desc" });
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // chỉ lấy giao dịch thành công
        const res = await api.get(`/transactions?payment_status=SUCCESS`);
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map(mapTxnToRow);
        if (!aborted) setRows(mapped);
      } catch (err) {
        console.error(err);
        if (!aborted) setError("Không thể tải lịch sử thanh toán");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  const filtered = useMemo(() => {
    let arr = [...rows];

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
    if (filters.from) arr = arr.filter((x) => toDate(x.date) >= new Date(filters.from));
    if (filters.to)   arr = arr.filter((x) => toDate(x.date) <= new Date(filters.to));
    if (filters.company) arr = arr.filter((x) => x.company === filters.company);
    if (filters.status)  arr = arr.filter((x) => x.status === filters.status);

    arr.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc": return toDate(a.date) - toDate(b.date);
        case "date_desc": return toDate(b.date) - toDate(a.date);
        case "amount_asc": return a.amount - b.amount;
        case "amount_desc": return b.amount - a.amount;
        default: return 0;
      }
    });
    return arr;
  }, [filters, rows]);

  // KPIs
  const kpi = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.amount, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const refunded = filtered.filter((x) => x.status === "Refunded").reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonth = filtered
      .filter((x) => {
        const d = toDate(x.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, x) => s + x.amount, 0);
    return { total, count, avg, refunded, thisMonth };
  }, [filtered]);

  // paging
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px] min-h-screen flex flex-col">
        <div className="px-4 md:px-6 py-6 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 md:p-7">
            <h2 className="text-[34px] md:text-[40px] leading-none font-extrabold text-blue-800 mb-5">
              Payment History
            </h2>
            <KpiCards
              total={kpi.total}
              count={kpi.count}
              avg={kpi.avg}
              refunded={kpi.refunded}
              thisMonth={kpi.thisMonth}
              fmt={fmtVND}
            />
          </section>

          <FilterBar onChange={(f) => { setFilters(f); setPage(1); }} />

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 text-center text-slate-500">
              Đang tải lịch sử thanh toán...
            </div>
          ) : error ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <PaymentTable
              rows={pageRows}
              page={page}
              pageSize={pageSize}
              totalCount={filtered.length}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => (end < filtered.length ? p + 1 : p))}
              fmt={fmtVND}
            />
          )}
        </div>
      </main>
    </>
  );
}
