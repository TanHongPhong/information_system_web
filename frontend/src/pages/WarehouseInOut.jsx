// File: src/pages/WarehouseInOut.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";
import { Link } from "react-router-dom";

export default function WarehouseInOut() {
  // ===== Mock data (giữ như v2) =====
  const DATA = useMemo(
    () => [
      {
        id: "DL04MP7045",
        type: "in",
        status: "Đang vận chuyển",
        customer: "Đặng Huy Tuấn",
        from: "Lào tồn",
        to: "TP.HCM",
        weight: 250,
        unit: "KG",
        pallets: 8,
        docks: "D1",
        carrier: "GMD-TRK-21",
        eta: "12/12/2025",
        temp: "Thường",
      },
      {
        id: "DL04MP7046",
        type: "out",
        status: "Đã xuất kho",
        customer: "Thái Lý Lộc",
        from: "Bình Định",
        to: "Hà Nội",
        weight: 2000,
        unit: "KG",
        pallets: 12,
        docks: "D3",
        carrier: "GMD-TRK-07",
        eta: "01/12/2025",
        temp: "Mát",
      },
      {
        id: "DL04MP7054",
        type: "in",
        status: "Lưu kho",
        customer: "Tân Hồng Phong",
        from: "Vũng Tàu",
        to: "Đồng Nai",
        weight: 540,
        unit: "KG",
        pallets: 10,
        docks: "D2",
        carrier: "GMD-TRK-12",
        eta: "12/07/2025",
        temp: "Mát",
      },
      {
        id: "DL04MP7525",
        type: "in",
        status: "Đang vận chuyển",
        customer: "Ngô Trọng Nhân",
        from: "Đồng Nai",
        to: "Nha Trang",
        weight: 938,
        unit: "KG",
        pallets: 15,
        docks: "D5",
        carrier: "GMD-TRK-33",
        eta: "20/07/2025",
        temp: "Lạnh",
      },
      {
        id: "DL04MP9845",
        type: "out",
        status: "Đang vận chuyển",
        customer: "Lê Quang Trường",
        from: "Khánh Hoà",
        to: "TP.HCM",
        weight: 12000,
        unit: "KG",
        pallets: 25,
        docks: "D4",
        carrier: "GMD-TRK-08",
        eta: "12/01/2025",
        temp: "Thường",
      },
      {
        id: "DL04MP7875",
        type: "in",
        status: "Lưu kho",
        customer: "Thái Lý Lộc",
        from: "Cà Mau",
        to: "Hà Nội",
        weight: 250,
        unit: "KG",
        pallets: 6,
        docks: "D2",
        carrier: "GMD-TRK-02",
        eta: "22/06/2025",
        temp: "Thường",
      },
      {
        id: "DL04MP7995",
        type: "out",
        status: "Lưu kho",
        customer: "Ngô Trọng Nhân",
        from: "Bến Tre",
        to: "Cà Mau",
        weight: 370,
        unit: "KG",
        pallets: 9,
        docks: "D6",
        carrier: "GMD-TRK-19",
        eta: "19/01/2025",
        temp: "Mát",
      },
      {
        id: "DL04MP4545",
        type: "in",
        status: "Đang vận chuyển",
        customer: "Đặng Huy Tuấn",
        from: "Vũng Tàu",
        to: "Vĩnh Long",
        weight: 920,
        unit: "KG",
        pallets: 14,
        docks: "D1",
        carrier: "GMD-TRK-17",
        eta: "17/08/2025",
        temp: "Thường",
      },
    ],
    []
  );

  // ===== UI state =====
  const [tab, setTab] = useState("all"); // 'all' | 'in' | 'out' | 'hold'
  const [dock, setDock] = useState("Tất cả");
  const [temp, setTemp] = useState("Tất cả");

  const baseRows = useMemo(
    () => (tab === "all" ? DATA : DATA.filter((d) => d.type === tab)),
    [DATA, tab]
  );
  const filteredRows = useMemo(
    () =>
      baseRows.filter(
        (d) =>
          (dock === "Tất cả" || d.docks === dock) &&
          (temp === "Tất cả" || d.temp === temp)
      ),
    [baseRows, dock, temp]
  );

  // Feather icons refresh after render
  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, [tab, dock, temp, filteredRows.length]);

  // KPI values
  const inboundToday = 34;
  const outboundToday = 29;
  const inTransit = baseRows.filter(
    (d) => d.status === "Đang vận chuyển"
  ).length;
  const alerts = 2;
  const capacityUsed = 72;

  // Export CSV
  const handleExport = () => {
    const rows = filteredRows;
    const header = [
      "Mã đơn",
      "Loại",
      "Trạng thái",
      "Khách hàng",
      "Điểm đi",
      "Điểm đến",
      "Pallets",
      "Khối lượng",
      "Door",
      "Xe/Container",
      "Ngày",
    ];
    const lines = [header.join(",")].concat(
      rows.map((o) =>
        [
          o.id,
          o.type,
          o.status,
          o.customer,
          o.from,
          o.to,
          o.pallets,
          `${o.weight} ${o.unit}`,
          o.docks,
          o.carrier,
          o.eta,
        ]
          .map((x) => `"${String(x).replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warehouse_in_out.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* ===== SIDEBAR ===== */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
            LGBT
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Trang chủ"
          >
            <i data-feather="home" />
          </Link>
          <Link
            to="/order-tracking"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Theo dõi vị trí"
          >
            <i data-feather="map" />
          </Link>
          <Link
            to="/warehouse"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Lịch sử giao dịch"
          >
            <i data-feather="file-text" />
          </Link>
          <button
            className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Thông báo"
          >
            <i data-feather="bell" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <a
            href="#"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Người dùng"
          >
            <i data-feather="user" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Cài đặt"
          >
            <i data-feather="settings" />
          </a>
        </div>
      </aside>

      <main className="ml-20">
        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i
                  data-feather="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm giao dịch, mã đơn, số tiền…"
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
              <button
                className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                title="New"
              >
                <i data-feather="plus" className="w-4 h-4" />
              </button>
              <button
                className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
                title="Notifications"
              >
                <i data-feather="bell" className="w-4 h-4" />
              </button>
              <button
                className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
                title="Archive"
              >
                <i data-feather="archive" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <img
                  src="https://i.pravatar.cc/40?img=8"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">
                    Deportation Manager
                  </div>
                </div>
                <i
                  data-feather="chevron-down"
                  className="w-4 h-4 text-slate-400"
                />
              </button>
            </div>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <section className="p-6 md:p-8 space-y-6">
          {/* Title & Controls */}
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Quản lý nhập / xuất kho
              </h2>
              <p className="text-slate-600">
                Theo dõi real-time, QR check-in/out, KPI & công suất kho.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2" id="tabs">
                <button
                  onClick={() => setTab("all")}
                  className={`tab-btn h-10 px-3 rounded-xl text-sm border ${
                    tab === "all"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTab("in")}
                  className={`tab-btn h-10 px-3 rounded-xl text-sm border ${
                    tab === "in"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Nhập kho
                </button>
                <button
                  onClick={() => setTab("out")}
                  className={`tab-btn h-10 px-3 rounded-xl text-sm border ${
                    tab === "out"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Xuất kho
                </button>
                <button
                  onClick={() => setTab("hold")}
                  className={`tab-btn h-10 px-3 rounded-xl text-sm border ${
                    tab === "hold"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Đang giữ tạm
                </button>
              </div>

              <select
                value={dock}
                onChange={(e) => setDock(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                {["Tất cả", "D1", "D2", "D3", "D4", "D5", "D6"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <select
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                {["Tất cả", "Thường", "Mát", "Lạnh"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  // just force re-run effects & maintain UX parity
                  feather.replace({ width: 21, height: 21 });
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
              >
                <i data-feather="refresh-cw" className="w-4 h-4" />
                <span>Tải lại</span>
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid md:grid-cols-5 gap-3" id="kpiRow">
            <Stat
              icon="package"
              label="Đã nhập hôm nay"
              value={inboundToday}
              tone="in"
            />
            <Stat
              icon="truck"
              label="Đã xuất hôm nay"
              value={outboundToday}
              tone="out"
            />
            <Stat
              icon="truck"
              label="Đang vận chuyển"
              value={inTransit}
              tone="neutral"
            />
            <Stat
              icon="alert-triangle"
              label="Cảnh báo"
              value={alerts}
              sub="Thiếu chứng từ: 1 • Lệch khối lượng: 1"
              tone="alert"
            />
            <div className="rounded-2xl p-4 border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <i data-feather="activity" className="w-4 h-4" />
                Công suất kho
              </div>
              <div className="mt-2">
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${capacityUsed}%` }}
                  />
                </div>
              </div>
              <div className="text-[12px] text-slate-500 mt-1">
                {capacityUsed}% sử dụng • 1.450/2.000 pallets
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2/3 */}
            <section className="xl:col-span-2 space-y-4">
              {/* Data Table */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
                <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-[#8CC2FF] via-[#6AA8FF] to-[#2A60FF] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-xl bg-white/20 grid place-items-center">
                      <i data-feather="package" className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <div className="opacity-90">Kho trung tâm</div>
                      <div className="font-semibold">Gemadept Logistics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2">
                      <i data-feather="upload" className="w-4 h-4" /> Import
                    </button>
                    <button
                      onClick={handleExport}
                      className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2"
                    >
                      <i data-feather="download" className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto thin-scrollbar">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        {[
                          "MÃ ĐƠN",
                          "LOẠI",
                          "TRẠNG THÁI",
                          "KHÁCH HÀNG",
                          "ĐIỂM ĐI",
                          "ĐIỂM ĐẾN",
                          "PALLETS",
                          "KHỐI LƯỢNG",
                          "DOOR",
                          "XE/CONTAINER",
                          "NGÀY",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[11px] tracking-wider font-semibold uppercase px-5 py-3"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.length ? (
                        filteredRows.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3 align-middle font-medium text-slate-900">
                              <span className="inline-block max-w-[140px] truncate align-middle">
                                {o.id}
                              </span>
                            </td>
                            <td className="px-5 py-3 align-middle">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 ${
                                  o.type === "in"
                                    ? "bg-blue-50 text-blue-700 ring-blue-200"
                                    : "bg-indigo-50 text-indigo-700 ring-indigo-200"
                                }`}
                              >
                                {o.type === "in" ? "Nhập" : "Xuất"}
                              </span>
                            </td>
                            <td className="px-5 py-3 align-middle">
                              <StatusBadge status={o.status} />
                            </td>
                            <td className="px-5 py-3 align-middle">
                              {o.customer}
                            </td>
                            <td className="px-5 py-3 align-middle">{o.from}</td>
                            <td className="px-5 py-3 align-middle">{o.to}</td>
                            <td className="px-5 py-3 align-middle">
                              {o.pallets}
                            </td>
                            <td className="px-5 py-3 align-middle">
                              {o.weight.toLocaleString()} {o.unit}
                            </td>
                            <td className="px-5 py-3 align-middle">
                              {o.docks}
                            </td>
                            <td className="px-5 py-3 align-middle">
                              {o.carrier}
                            </td>
                            <td className="px-5 py-3 align-middle text-right pr-5 text-slate-600">
                              {o.eta}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={11}
                            className="px-5 py-6 text-center text-slate-500"
                          >
                            Không có bản ghi phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Right 1/3: Camera QR & snapshots */}
            <aside className="xl:col-span-1 flex flex-col gap-5">
              <QRCameraPanel />

              {/* Legend */}
              <div className="text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" />
                  <span>NHẬP HÀNG (INBOUND)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                  <span>XUẤT HÀNG (OUTBOUND)</span>
                </div>
              </div>

              {/* Inventory snapshot */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <i data-feather="box" className="w-4 h-4" /> Tồn kho nhanh
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kệ thường</span>
                    <span className="font-medium">1.120 pallets</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kho mát</span>
                    <span className="font-medium">210 pallets</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kho lạnh</span>
                    <span className="font-medium">120 pallets</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-600 mb-1">
                    Tỷ lệ lấp đầy
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: "72%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Staff */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <i data-feather="users" className="w-4 h-4" /> Nhân sự ca hôm
                  nay
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Ca sáng</span>
                    <span className="text-slate-700">
                      12 NV (2 QC, 1 Supervisor)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ca chiều</span>
                    <span className="text-slate-700">
                      10 NV (1 QC, 1 Supervisor)
                    </span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-xs mt-4 mb-6">
          © 2025 Gemadept – Trang quản lý nhập / xuất kho.
        </footer>
      </main>
    </div>
  );
}

/* =============== Subcomponents =============== */
function Stat({ icon, label, value, sub, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-slate-50",
    in: "bg-blue-50",
    out: "bg-indigo-50",
    alert: "bg-rose-50",
  };
  return (
    <div className={`rounded-2xl p-4 border border-slate-200 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <i data-feather={icon} className="w-4 h-4" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      {sub ? (
        <div className="text-[12px] text-slate-500 mt-1">{sub}</div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Đã xuất kho": "bg-red-50 text-red-600 ring-red-200",
    "Lưu kho": "bg-emerald-50 text-emerald-600 ring-emerald-200",
    "Đang vận chuyển": "bg-blue-50 text-blue-600 ring-blue-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1 min-w-[112px] ${cls}`}
    >
      {status}
    </span>
  );
}

function QRCameraPanel() {
  const [mode, setMode] = useState("IN"); // IN | OUT
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const html5CtorRef = useRef(null);
  const readerRef = useRef(null);
  const idRef = useRef(`qrReader-${Math.random().toString(36).slice(2)}`);

  // Load html5-qrcode lazily (robust cho Vite, ESM & CDN)
  useEffect(() => {
    let mounted = true;

    if (typeof window !== "undefined") {
      (async () => {
        try {
          const mod = await import("html5-qrcode");
          const Html5Qrcode =
            mod?.Html5Qrcode ??
            mod?.default?.Html5Qrcode ??
            // fallback nếu dùng CDN gắn window
            window.Html5Qrcode;
          if (mounted) html5CtorRef.current = Html5Qrcode || null;
        } catch (err) {
          console.error("Failed to load html5-qrcode", err);
          html5CtorRef.current =
            typeof window !== "undefined" ? window.Html5Qrcode : null;
        }
      })();
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Pre-ask camera permission & list devices
  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices
          .getUserMedia({ video: true })
          .catch(() => {});
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        setCameras(cams);
        if (cams.length) {
          setCurrentCameraId(cams[0].deviceId);
        }
      } catch (err) {
        setErrorMsg(
          "Không truy cập được camera. Hãy cấp quyền cho trình duyệt."
        );
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    // Clean up reader on unmount
    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const cfg = { fps: 10, qrbox: { width: 260, height: 260 } };

  const onScanSuccess = (decodedText) => {
    setLastResult(decodedText);
    // bắn event ra outside nếu muốn consume ở nơi khác:
    window.dispatchEvent(
      new CustomEvent("qr-scan", {
        detail: { code: decodedText, mode, ts: Date.now() },
      })
    );
    pause();
  };
  const onScanError = () => {};

  const start = async () => {
    if (running || !currentCameraId) return;
    if (!html5CtorRef.current) {
      alert(
        "Thiếu thư viện html5-qrcode. Cài bằng: npm i html5-qrcode\nHoặc chèn CDN vào public/index.html"
      );
      return;
    }
    if (!readerRef.current) {
      readerRef.current = new html5CtorRef.current(idRef.current);
    }
    try {
      await readerRef.current.start(
        { deviceId: { exact: currentCameraId } },
        cfg,
        onScanSuccess,
        onScanError
      );
      setRunning(true);
    } catch (err) {
      console.error(err);
      alert("Không thể khởi động camera này. Hãy thử đổi camera.");
    }
  };

  const pause = async () => {
    if (!readerRef.current || !running) return;
    try {
      await readerRef.current.stop();
      setRunning(false);
    } catch (err) {
      console.error(err);
    }
  };

  const restart = async () => {
    await pause();
    await start();
  };

  const switchCamera = () => {
    if (!cameras.length) return;
    const idx = cameras.findIndex((c) => c.deviceId === currentCameraId);
    const next = (idx + 1) % cameras.length;
    setCurrentCameraId(cameras[next].deviceId);
    if (running) restart();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <i data-feather="grid" className="w-4 h-4" /> QR Check-in/out (Camera)
      </div>

      <div
        className="flex flex-col gap-3"
        aria-label="Khu vực camera quét mã QR nhập/xuất"
      >
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Chế độ:</span>
          <div className="inline-flex rounded-xl ring-1 ring-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("IN")}
              className={`px-3 py-1.5 text-sm font-semibold ${
                mode === "IN"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Check-in (Nhập)
            </button>
            <button
              type="button"
              onClick={() => setMode("OUT")}
              className={`px-3 py-1.5 text-sm font-semibold ${
                mode === "OUT"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Check-out (Xuất)
            </button>
          </div>
        </div>

        {/* Camera selector */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Camera:</span>
          <select
            value={currentCameraId || ""}
            onChange={(e) => {
              setCurrentCameraId(e.target.value);
              if (running) restart();
            }}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm min-w-[180px]"
          >
            {cameras.length ? (
              cameras.map((c, idx) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {`Camera ${idx + 1}` + (c.label ? ` – ${c.label}` : "")}
                </option>
              ))
            ) : (
              <option>Đang tải danh sách…</option>
            )}
          </select>
          <button
            type="button"
            onClick={switchCamera}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
          >
            <i data-feather="refresh-cw" className="w-4 h-4" /> Đổi camera
          </button>
        </div>

        {/* Reader */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
          <div
            id={idRef.current}
            className="rounded-lg overflow-hidden"
            style={{ aspectRatio: "1/1", maxWidth: 320, margin: "0 auto" }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={running || !currentCameraId}
            className="h-9 px-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <i data-feather="play" className="w-4 h-4" /> Bắt đầu quét
          </button>
          <button
            type="button"
            onClick={pause}
            disabled={!running}
            className="h-9 px-3 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <i data-feather="pause" className="w-4 h-4" /> Tạm dừng
          </button>
        </div>

        {/* Result */}
        {lastResult && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[12px] text-emerald-700 mb-1 font-semibold">
              Kết quả quét
            </div>
            <div className="text-sm font-mono text-emerald-800 break-all">
              {lastResult}
            </div>
            <div className="mt-1 text-[12px] text-slate-600">
              Chế độ hiện tại:{" "}
              <span className="font-semibold">
                {mode === "IN" ? "NHẬP" : "XUẤT"}
              </span>
            </div>
          </div>
        )}

        {errorMsg ? (
          <p className="text-[12px] text-rose-600 mt-1">{errorMsg}</p>
        ) : (
          <p className="text-[12px] text-slate-500 mt-1">
            Tip: nếu có nhiều camera, hãy chọn “Camera 2” (thường là camera sau
            của điện thoại).
          </p>
        )}
      </div>
    </div>
  );
}
