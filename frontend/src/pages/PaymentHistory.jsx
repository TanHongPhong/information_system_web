// src/pages/PaymentHistory.jsx
import { useMemo, useState } from "react";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import { KpiCards } from "../components/history/KpiCards.jsx";
import { FilterBar } from "../components/history/FilterBar.jsx";
import { PaymentTable } from "../components/history/PaymentTable.jsx";

// ==== Helpers (inline, không cần helpers.js) ====
const fmtVND = (v) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const toDate = (dmy) => {
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, m - 1, d);
};

// ==== Demo data ====
const PAYMENTS = [
  { id: "#322138483848", date: "15/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
  { id: "#2458745233343", date: "15/10/2025", amount: 2500000,  company: "Thái Bình Dương Logistics", method: "Thẻ VISA",  status: "Pending" },
  { id: "#998877665544",  date: "14/10/2025", amount: 4800000,  company: "DHL",      method: "Ví điện tử", status: "Paid" },
  { id: "#445566778899",  date: "10/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Refunded" },
  { id: "#112233445566",  date: "08/10/2025", amount: 7200000,  company: "Transimex", method: "Thẻ VISA",    status: "Paid" },
  { id: "#556677889900",  date: "03/10/2025", amount: 3500000,  company: "DHL",      method: "Ví điện tử",   status: "Paid" },
  { id: "#123450987654",  date: "29/09/2025", amount: 15000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
  { id: "#777888999000",  date: "18/09/2025", amount: 2000000,  company: "Thái Bình Dương Logistics", method: "Thẻ VISA", status: "Refunded" },
  { id: "#333222111000",  date: "02/09/2025", amount: 5600000,  company: "Transimex", method: "Chuyển khoản", status: "Pending" },
  { id: "#111222333444",  date: "25/08/2025", amount: 9900000,  company: "DHL",      method: "Ví điện tử",   status: "Paid" },
  { id: "#222333444555",  date: "10/08/2025", amount: 8700000,  company: "Gemadept", method: "Thẻ VISA",     status: "Paid" },
  { id: "#666555444333",  date: "05/08/2025", amount: 4200000,  company: "DHL",      method: "Chuyển khoản", status: "Paid" },
];

export default function PaymentHistory() {
  const [filters, setFilters] = useState({ q:"", from:"", to:"", company:"", status:"", sortBy:"date_desc" });
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
  }, [filters]);

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

          <PaymentTable
            rows={pageRows}
            page={page}
            pageSize={pageSize}
            totalCount={filtered.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => (end < filtered.length ? p + 1 : p))}
            fmt={fmtVND}
          />
        </div>
      </main>
    </>
  );
}
