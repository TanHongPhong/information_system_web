import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import KpiCards from "../components/history/KpiCards";
import FilterBar from "../components/history/FilterBar";
import HistoryTable from "../components/history/HistoryTable";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function PaymentHistory() {
  const toDate = (s) => {
    const [d, m, y] = s.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const fmtVND = (v) =>
    Number(v).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });

  const DATA = useMemo(
    () => [
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

  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, []);
  useEffect(() => {
    feather.replace({ width: 18, height: 18 });
  });

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
  }, [DATA, q, fromDate, toDateStr, company, status, sortBy]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [q, fromDate, toDateStr, company, status, sortBy]);

  const pageRows = filtered.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  const { total, count, avg, refunded, thisMonth } = useMemo(() => {
    const totalV = filtered.reduce((s, x) => s + x.amount, 0);
    const countV = filtered.length;
    const avgV = countV ? totalV / countV : 0;
    const refundedV = filtered
      .filter((x) => x.status === "Refunded")
      .reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonthV = filtered
      .filter((x) => {
        const d = toDate(x.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, x) => s + x.amount, 0);

    return {
      total: totalV,
      count: countV,
      avg: avgV,
      refunded: refundedV,
      thisMonth: thisMonthV,
    };
  }, [filtered]);

  const resetFilters = () => {
    setQ("");
    setFromDate("");
    setToDateStr("");
    setCompany("");
    setStatus("");
    setSortBy("date_desc");
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <style>{`body{font-family:Inter,ui-sans-serif,system-ui}`}</style>
      <Sidebar />
      <main className="ml-20 min-h-screen flex flex-col">
        <Topbar />
        {/* KPI */}
        <section className="bg-slate-100/60 border-b border-slate-200">
          <div className="px-4 md:px-6 py-6">
            <KpiCards
              total={total}
              thisMonth={thisMonth}
              count={count}
              avg={avg}
              refunded={refunded}
              fmtVND={fmtVND}
            />
          </div>
        </section>

        {/* Filter bar */}
        <section className="px-4 md:px-6 pt-6">
          <FilterBar
            q={q}
            setQ={setQ}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDateStr={toDateStr}
            setToDateStr={setToDateStr}
            company={company}
            setCompany={setCompany}
            status={status}
            setStatus={setStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
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
