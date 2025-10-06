// PaymentHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";

export default function PaymentHistory() {
  // ===== Helpers =====
  const toDate = (s) => {
    // "dd/mm/yyyy" -> Date
    const [d, m, y] = s.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const fmtVND = (v) =>
    Number(v).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });

  // ===== Demo data =====
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

  // ===== Filters state =====
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDateStr, setToDateStr] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ===== Feather icons =====
  useEffect(() => {
    feather.replace({ width: 21, height: 21 }); // header/sidebar
  }, []);
  useEffect(() => {
    feather.replace({ width: 18, height: 18 }); // table/body after updates
  });

  // ===== Derived: filtered + sorted =====
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
    // reset về trang 1 khi bộ lọc đổi
    setPage(1);
  }, [q, fromDate, toDateStr, company, status, sortBy]);

  const pageRows = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  // ===== KPIs (theo filtered) =====
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
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, x) => s + x.amount, 0);

    return { total: totalV, count: countV, avg: avgV, refunded: refundedV, thisMonth: thisMonthV };
  }, [filtered]);

  // ===== Small presentational bits =====
  const MethodIcon = ({ method }) => {
    const icon = method.includes("Thẻ") ? "credit-card" : method.includes("Ví") ? "smartphone" : "banknote";
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-700">
        <i data-feather={icon} className="w-4 h-4" />
        {method}
      </span>
    );
  };
  const StatusBadge = ({ status }) => {
    const map = {
      Paid: "bg-green-50 text-green-700 ring-1 ring-green-200",
      Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      Refunded: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
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

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <style>{`body{font-family:Inter,ui-sans-serif,system-ui}`}</style>

      {/* Sidebar */}
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

      {/* Main */}
      <main className="ml-20 min-h-screen flex flex-col">
        {/* Header */}
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

        {/* KPI Section */}
        <section className="bg-slate-100/60 border-b border-slate-200">
          <div className="px-4 md:px-6 py-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 md:p-7">
              <h2 className="text-[34px] md:text-[40px] leading-none font-extrabold text-blue-800 mb-5">Payment History</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Tổng thanh toán</p>
                    <i data-feather="credit-card" className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{fmtVND(total)}</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">{fmtVND(thisMonth)} trong tháng này</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Số giao dịch</p>
                    <i data-feather="list" className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{count}</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Đã lọc</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Giá trị trung bình</p>
                    <i data-feather="bar-chart-2" className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">{fmtVND(avg)}</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Theo danh sách hiện tại</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Hoàn tiền</p>
                    <i data-feather="rotate-ccw" className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="mt-2 text-3xl md:text-4xl font-extrabold text-rose-600">{fmtVND(refunded)}</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Giá trị Refunded</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="px-4 md:px-6 pt-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-soft">
            <div className="grid lg:grid-cols-12 gap-3 md:gap-4">
              <div className="lg:col-span-3">
                <label className="text-sm text-slate-600">Tìm kiếm</label>
                <div className="mt-1 relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    type="text"
                    placeholder="Mã đơn / công ty / số tiền…"
                    className="w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 pl-9"
                  />
                  <i data-feather="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Từ ngày</label>
                  <input
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    type="date"
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Đến ngày</label>
                  <input
                    value={toDateStr}
                    onChange={(e) => setToDateStr(e.target.value)}
                    type="date"
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Công ty</label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option>Gemadept</option>
                    <option>Thái Bình Dương Logistics</option>
                    <option>DHL</option>
                    <option>Transimex</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Sắp xếp</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-1 w-full h-[42px] rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="date_desc">Ngày ↓</option>
                    <option value="date_asc">Ngày ↑</option>
                    <option value="amount_desc">Số tiền ↓</option>
                    <option value="amount_asc">Số tiền ↑</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setQ("");
                      setFromDate("");
                      setToDateStr("");
                      setCompany("");
                      setStatus("");
                      setSortBy("date_desc");
                    }}
                    className="w-full h-[42px] rounded-xl border border-slate-300 hover:bg-slate-50"
                  >
                    Xóa lọc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="px-4 md:px-6 py-6">
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
                  {pageRows.map((r) => (
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
                  {pageRows.length === 0 && (
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
                Hiển thị {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} /{" "}
                {filtered.length} giao dịch
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
        </section>
      </main>
    </div>
  );
}
