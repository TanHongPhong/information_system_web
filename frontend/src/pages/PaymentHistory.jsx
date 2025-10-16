import { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import KPISection from "../components/history/KPISection.jsx";
import FilterBar from "../components/history/FilterBar.jsx";
import PaymentsTable from "../components/history/PaymentsTable.jsx";

const RAW = [
  { id: "#322138483848", date: "15/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
  { id: "#2458745233343", date: "15/10/2025", amount: 2500000,  company: "Thái Bình Dương Logistics", method: "Thẻ VISA",   status: "Pending" },
  { id: "#998877665544",  date: "14/10/2025", amount: 4800000,  company: "DHL",      method: "Ví điện tử", status: "Paid" },
  { id: "#445566778899",  date: "10/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Refunded" },
  { id: "#112233445566",  date: "08/10/2025", amount: 7200000,  company: "Transimex", method: "Thẻ VISA",   status: "Paid" },
  { id: "#556677889900",  date: "03/10/2025", amount: 3500000,  company: "DHL",      method: "Ví điện tử", status: "Paid" },
  { id: "#123450987654",  date: "29/09/2025", amount: 15000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
  { id: "#777888999000",  date: "18/09/2025", amount: 2000000,  company: "Thái Bình Dương Logistics", method: "Thẻ VISA", status: "Refunded" },
  { id: "#333222111000",  date: "02/09/2025", amount: 5600000,  company: "Transimex", method: "Chuyển khoản", status: "Pending" },
  { id: "#111222333444",  date: "25/08/2025", amount: 9900000,  company: "DHL",      method: "Ví điện tử", status: "Paid" },
  { id: "#222333444555",  date: "10/08/2025", amount: 8700000,  company: "Gemadept", method: "Thẻ VISA",   status: "Paid" },
  { id: "#666555444333",  date: "05/08/2025", amount: 4200000,  company: "DHL",      method: "Chuyển khoản", status: "Paid" },
];

const toDateObj = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
};
const fmtVND = (v) => v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function App() {
  // icons cho header/sidebar
  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);

  // ===== Filters state (đơn giản, đủ xài) =====
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(""); // yyyy-mm-dd (giá trị input)
  const [to, setTo] = useState("");
  const [company, setCompany] = useState("");
  const [stat, setStat] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // reset page khi filter đổi
  useEffect(() => { setPage(1); }, [q, from, to, company, stat, sortBy]);

  // ===== Lọc + sắp xếp =====
  const filtered = useMemo(() => {
    let arr = RAW.slice();

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const onlyDigits = needle.replace(/[^\d]/g, "");
      arr = arr.filter(x =>
        x.id.toLowerCase().includes(needle) ||
        x.company.toLowerCase().includes(needle) ||
        String(x.amount).includes(onlyDigits)
      );
    }
    if (from) {
      const f = new Date(from + "T00:00:00");
      arr = arr.filter(x => toDateObj(x.date) >= f);
    }
    if (to) {
      const t = new Date(to + "T23:59:59");
      arr = arr.filter(x => toDateObj(x.date) <= t);
    }
    if (company) arr = arr.filter(x => x.company === company);
    if (stat) arr = arr.filter(x => x.status === stat);

    arr.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":    return toDateObj(a.date) - toDateObj(b.date);
        case "date_desc":   return toDateObj(b.date) - toDateObj(a.date);
        case "amount_asc":  return a.amount - b.amount;
        case "amount_desc": return b.amount - a.amount;
        default: return 0;
      }
    });
    return arr;
  }, [q, from, to, company, stat, sortBy]);

  // ===== KPI =====
  const kpi = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.amount, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const refunded = filtered.filter(x => x.status === "Refunded").reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonth = filtered
      .filter(x => {
        const d = toDateObj(x.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, x) => s + x.amount, 0);
    return { total, count, avg, refunded, thisMonth };
  }, [filtered]);

  // ===== Phân trang =====
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ"><i data-feather="home" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><i data-feather="map" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Lịch sử giao dịch"><i data-feather="file-text" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><i data-feather="user" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><i data-feather="settings" /></button>
        </div>
      </aside>

      <main className="ml-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-4 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Tìm giao dịch, mã đơn, số tiền..." />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
                  <i data-feather="filter" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New"><i data-feather="plus" className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications"><i data-feather="bell" className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive"><i data-feather="archive" className="w-4 h-4" /></button>
              <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
                <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <i data-feather="chevron-down" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* KPI */}
        <section className="bg-slate-100/60 border-b border-slate-200">
          <div className="px-4 md:px-6 py-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 md:p-7">
              <h2 className="text-[34px] md:text-[40px] leading-none font-extrabold text-blue-800 mb-5">Payment History</h2>
              <KPISection
                total={fmtVND(kpi.total)}
                count={kpi.count}
                avg={fmtVND(kpi.avg)}
                refunded={fmtVND(kpi.refunded)}
                thisMonth={fmtVND(kpi.thisMonth)}
              />
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 md:px-6 pt-6">
          <FilterBar
            q={q} onQ={setQ}
            from={from} onFrom={setFrom}
            to={to} onTo={setTo}
            company={company} onCompany={setCompany}
            status={stat} onStatus={setStat}
            sortBy={sortBy} onSortBy={setSortBy}
            onClear={() => { setQ(""); setFrom(""); setTo(""); setCompany(""); setStat(""); setSortBy("date_desc"); }}
          />
        </section>

        {/* Table */}
        <section className="px-4 md:px-6 py-6">
          <PaymentsTable
            rows={rows}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            canPrev={page > 1}
            canNext={page < totalPages}
            fmtVND={fmtVND}
          />
        </section>
      </main>
    </div>
  );
}
