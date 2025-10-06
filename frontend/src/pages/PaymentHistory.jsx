import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import KpiCards from "../components/history/KpiCards";
import FilterBar from "../components/history/FilterBar";
import HistoryTable from "../components/history/HistoryTable";

export default function PaymentHistory() {
  const toDate = (s) => {
    const [d, m, y] = s.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const fmtVND = (v) =>
    Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

  const DATA = useMemo(
    () => [
      { id: "#322138483848", date: "15/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
      { id: "#2458745233343", date: "15/10/2025", amount: 2500000, company: "Thái Bình Dương Logistics", method: "Thẻ VISA", status: "Pending" },
      { id: "#998877665544", date: "14/10/2025", amount: 4800000, company: "DHL", method: "Ví điện tử", status: "Paid" },
      { id: "#445566778899", date: "10/10/2025", amount: 10000000, company: "Gemadept", method: "Chuyển khoản", status: "Refunded" },
      { id: "#112233445566", date: "08/10/2025", amount: 7200000, company: "Transimex", method: "Thẻ VISA", status: "Paid" },
      { id: "#556677889900", date: "03/10/2025", amount: 3500000, company: "DHL", method: "Ví điện tử", status: "Paid" },
      { id: "#123450987654", date: "29/09/2025", amount: 15000000, company: "Gemadept", method: "Chuyển khoản", status: "Paid" },
      { id: "#777888999000", date: "18/09/2025", amount: 2000000, company: "Thái Bình Dương Logistics", method: "Thẻ VISA", status: "Refunded" },
      { id: "#333222111000", date: "02/09/2025", amount: 5600000, company: "Transimex", method: "Chuyển khoản", status: "Pending" },
      { id: "#111222333444", date: "25/08/2025", amount: 9900000, company: "DHL", method: "Ví điện tử", status: "Paid" },
      { id: "#222333444555", date: "10/08/2025", amount: 8700000, company: "Gemadept", method: "Thẻ VISA", status: "Paid" },
      { id: "#666555444333", date: "05/08/2025", amount: 4200000, company: "DHL", method: "Chuyển khoản", status: "Paid" },
    ],
    []
  );

  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDateStr, setToDateStr] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  const filtered = useMemo(() => {
    let arr = DATA.slice();

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      const digits = qq.replace(/[^\d]/g, "");
      arr = arr.filter(
        (x) =>
          x.id.toLowerCase().includes(qq) ||
          x.company.toLowerCase().includes(qq) ||
          String(x.amount).includes(digits)
      );
    }
    if (fromDate) {
      const f = new Date(fromDate);
      arr = arr.filter((x) => toDate(x.date) >= f);
    }
    if (toDateStr) {
      const t = new Date(toDateStr);
      arr = arr.filter((x) => toDate(x.date) <= t);
    }
    if (company) arr = arr.filter((x) => x.company === company);
    if (status) arr = arr.filter((x) => x.status === status);

    arr.sort((a, b) => {
      switch (sortBy) {
        case "date_asc": return toDate(a.date) - toDate(b.date);
        case "date_desc": return toDate(b.date) - toDate(a.date);
        case "amount_asc": return a.amount - b.amount;
        case "amount_desc": return b.amount - a.amount;
        default: return 0;
      }
    });

    return arr;
  }, [DATA, q, fromDate, toDateStr, company, status, sortBy]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { setPage(1); }, [q, fromDate, toDateStr, company, status, sortBy]);

  const pageRows = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const { total, count, avg, refunded, thisMonth } = useMemo(() => {
    const totalV = filtered.reduce((s, x) => s + x.amount, 0);
    const countV = filtered.length;
    const avgV = countV ? totalV / countV : 0;
    const refundedV = filtered.filter((x) => x.status === "Refunded").reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonthV = filtered
      .filter((x) => {
        const d = toDate(x.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, x) => s + x.amount, 0);

    return { total: totalV, count: countV, avg: avgV, refunded: refundedV, thisMonth: thisMonthV };
  }, [filtered]);

  const resetFilters = () => {
    setQ(""); setFromDate(""); setToDateStr(""); setCompany(""); setStatus(""); setSortBy("date_desc");
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <style>{`body{font-family:Inter,ui-sans-serif,system-ui}`}</style>

      {/* Sidebar giữ nguyên từ bản gốc */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ">
            <i data-feather="home" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí">
            <i data-feather="map" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch">
            <i data-feather="file-text" />
          </button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng">
            <i data-feather="user" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      <main className="ml-20 min-h-screen flex flex-col">
        {/* Header giữ nguyên */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-4 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <i data-feather="filter" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
                <i data-feather="plus" className="w-4 h-4" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
                <i data-feather="bell" className="w-4 h-4" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
                <i data-feather="archive" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
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
            <KpiCards total={total} thisMonth={thisMonth} count={count} avg={avg} refunded={refunded} fmtVND={fmtVND} />
          </div>
        </section>

        {/* Filter bar */}
        <section className="px-4 md:px-6 pt-6">
          <FilterBar
            q={q} setQ={setQ}
            fromDate={fromDate} setFromDate={setFromDate}
            toDateStr={toDateStr} setToDateStr={setToDateStr}
            company={company} setCompany={setCompany}
            status={status} setStatus={setStatus}
            sortBy={sortBy} setSortBy={setSortBy}
            onReset={() => {
              resetFilters();
            }}
          />
        </section>

        {/* Table */}
        <section className="px-4 md:px-6 py-6">
          <HistoryTable
            rows={pageRows}
            fmtVND={fmtVND}
            page={page}
            setPage={setPage}
            maxPage={maxPage}
            filteredLength={filtered.length}
            pageSize={pageSize}
          />
        </section>
      </main>
    </div>
  );
}
