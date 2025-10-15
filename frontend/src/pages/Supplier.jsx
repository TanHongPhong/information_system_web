// Supplier.jsx — single-file compact version (no hooks/lib/data folders)
// All components and data are co-located here for portability.

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import feather from "feather-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ⬇️ Dùng sidebar/topbar CHUNG của system
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js once
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

// --------------------------------------
// Inline data (can be replaced by API later)
// --------------------------------------
const AREA_CHART = {
  labels: ["01", "05", "10", "15", "20", "25", "30"],
  points: [20, 45, 80, 110, 145, 170, 190],
  yMin: 0,
  yMax: 250,
  yStep: 50,
};

const DONUT_CHART = {
  labels: [
    "Đang VC",
    "Nhận hàng delay",
    "Sẵn sàng nhận",
    "Gửi hàng delay",
    "Sẵn sàng gửi",
    "Huỷ",
  ],
  values: [40, 23, 12, 12, 3, 3],
  colors: ["#0b2875", "#ef4444", "#2563eb", "#60a5fa", "#3b82f6", "#d97706"],
};

const LATEST_SHIPPING = [
  {
    id: "#ID12345678",
    customer: "Lương Quang Tràn",
    route: "Vũng Tàu → Đà Nẵng",
    eta: "2025-10-20",
    status: "Active",
  },
  {
    id: "#ID12345679",
    customer: "Công Ty ABC",
    route: "TP.HCM → Hà Nội",
    eta: "2025-10-15",
    status: "Delivered",
  },
  {
    id: "#ID12345680",
    customer: "Nguyễn Văn An",
    route: "Hải Phòng → Cần Thơ",
    eta: "2025-10-22",
    status: "Pending",
  },
  {
    id: "#ID12345681",
    customer: "Trần Thị Bích",
    route: "Bình Dương → Đồng Nai",
    eta: "2025-10-18",
    status: "Cancelled",
  },
  {
    id: "#ID12345682",
    customer: "Lê Hữu Phước",
    route: "Đà Lạt → Nha Trang",
    eta: "2025-10-25",
    status: "Delivered",
  },
  {
    id: "#ID12345683",
    customer: "Phạm Gia Hân",
    route: "Biên Hòa → TP.HCM",
    eta: "2025-11-08",
    status: "Active",
  },
  {
    id: "#ID12345684",
    customer: "Công Ty Rồng Việt",
    route: "Hà Nội → Đà Nẵng",
    eta: "2025-11-12",
    status: "Active",
  },
  {
    id: "#ID12345685",
    customer: "Hoàng Anh Tuấn",
    route: "Cà Mau → Bạc Liêu",
    eta: "2025-10-30",
    status: "Pending",
  },
  {
    id: "#ID12345686",
    customer: "Ngô Bảo Châu",
    route: "TP.HCM → Vũng Tàu",
    eta: "2025-12-02",
    status: "Delivered",
  },
  {
    id: "#ID12345687",
    customer: "Tập đoàn FPT",
    route: "Hà Nội → TP.HCM",
    eta: "2025-12-15",
    status: "Active",
  },
];

const ORDER_REQUESTS = [
  {
    orderCode: "ORDERID 0112",
    time: "2025-10-20 09:00",
    from: "279 Nguyễn Tri Phương P8 Q10 TPHCM",
    to: "777 Lê Lai P3 Q1 TP.Hà Nội",
    initials: "QT",
    name: "Quang Trè",
    avatarTone: "indigo",
    latA: 10.7676,
    lngA: 106.6667,
    latB: 21.0285,
    lngB: 105.8542,
    isNew: true,
  },
  {
    orderCode: "ORDERID 0255",
    time: "2025-10-22 14:00",
    from: "436 Trường Sa P3 Q7 TPHCM",
    to: "555 Phan Đăng Lưu P7 Q.Phú Nhuận",
    initials: "VA",
    name: "Văn An",
    avatarTone: "green",
    latA: 10.788,
    lngA: 106.68,
    latB: 10.8009,
    lngB: 106.6809,
  },
  {
    orderCode: "ORDERID 8813",
    time: "2025-10-28 11:30",
    from: "KCN Amata, Biên Hòa, Đồng Nai",
    to: "KCN Sóng Thần, Dĩ An, Bình Dương",
    initials: "TB",
    name: "Trần Bích",
    avatarTone: "red",
    latA: 10.9452,
    lngA: 106.8553,
    latB: 10.8876,
    lngB: 106.7431,
  },
  {
    orderCode: "ORDERID 9021",
    time: "2025-11-01 08:00",
    from: "123 Lê Lợi, P. Bến Thành, Q.1, TPHCM",
    to: "456 Hai Bà Trưng, P. Tân Định, Q.1",
    initials: "HP",
    name: "Hữu Phước",
    avatarTone: "purple",
    latA: 10.7755,
    lngA: 106.7019,
    latB: 10.786,
    lngB: 106.6903,
  },
  {
    orderCode: "ORDERID 9134",
    time: "2025-11-05 10:00",
    from: "789 Nguyễn Văn Cừ, P.4, Q.5, TPHCM",
    to: "321 Trần Hưng Đạo, P. Cầu Ông Lãnh, Q.1",
    initials: "GH",
    name: "Gia Hân",
    avatarTone: "blue",
    latA: 10.7598,
    lngA: 106.675,
    latB: 10.769,
    lngB: 106.694,
  },
  {
    orderCode: "ORDERID 9278",
    time: "2025-11-10 15:30",
    from: "456 Lý Thường Kiệt, P.7, Q. Tân Bình, TPHCM",
    to: "123 Nguyễn Huệ, P. Bến Nghé, Q.1",
    initials: "AT",
    name: "Anh Tuấn",
    avatarTone: "orange",
    latA: 10.797,
    lngA: 106.66,
    latB: 10.7765,
    lngB: 106.7005,
  },
  {
    orderCode: "ORDERID 9356",
    time: "2025-11-15 09:45",
    from: "321 Phạm Văn Đồng, P.3, Q. Gò Vấp, TPHCM",
    to: "654 Lê Văn Sỹ, P.11, Q.3",
    initials: "BC",
    name: "Bảo Châu",
    avatarTone: "teal",
    latA: 10.821,
    lngA: 106.686,
    latB: 10.784,
    lngB: 106.676,
  },
];

// --------------------------------------
// Small inline UI helpers/components
// --------------------------------------

function IconsSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
      <symbol
        id="i-truck"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 17h4V5H2v12h3m0 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0z" />
        <path d="M22 17H14a2 2 0 1 0-4 0h3m-1-12l-3-4h5l3 4" />
      </symbol>
      <symbol
        id="i-clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </symbol>
      <symbol
        id="i-badge-check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l1.42 1.42a1 1 0 0 0 1.41 0l1.42-1.42a4 4 0 1 1 5.66 5.66l-1.42 1.42a1 1 0 0 0 0 1.41l1.42 1.42a4 4 0 1 1-5.66 5.66l-1.42-1.42a1 1 0 0 0-1.41 0l-1.42 1.42a4 4 0 1 1-5.66-5.66l1.42-1.42a1 1 0 0 0 0-1.41L3.85 8.62z" />
        <path d="m9 12 2 2 4-4" />
      </symbol>
    </svg>
  );
}

function OrdersAreaMini({ labels, points, yMin = 0, yMax = 250, yStep = 50 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, "rgba(59,130,246,.4)");
    grad.addColorStop(1, "rgba(59,130,246,0)");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: points,
            borderColor: "#3b82f6",
            backgroundColor: grad,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBorderColor: "#fff",
            pointHoverBackgroundColor: "#3b82f6",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: {
            min: yMin,
            max: yMax,
            ticks: { stepSize: yStep },
            grid: { color: "rgba(15,23,42,0.06)" },
            border: { dash: [5, 5] },
          },
        },
      },
    });
    return () => chartRef.current?.destroy?.();
  }, [labels, points, yMin, yMax, yStep]);
  return <canvas ref={canvasRef} height="150" aria-label="Biểu đồ đơn hàng" />;
}

function TruckDonutMini({ labels, values, colors }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 6,
            spacing: 2,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}` } },
        },
      },
    });
    return () => chartRef.current?.destroy?.();
  }, [labels, values, colors]);
  return <canvas ref={canvasRef} aria-label="Tình trạng xe" />;
}

const STATUS_STYLES = {
  Active: "bg-emerald-100 text-emerald-800",
  Delivered: "bg-blue-100 text-blue-800",
  Pending: "bg-amber-100 text-amber-800",
  Cancelled: "bg-red-100 text-red-800",
};
const DOT_STYLES = {
  Active: "bg-emerald-500",
  Delivered: "bg-blue-500",
  Pending: "bg-amber-500",
  Cancelled: "bg-red-500",
};

function LatestShippingTable({ rows = [] }) {
  return (
    <section className="card h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Shipping</h3>
        {/* Điều hướng sang /order-tracking */}
        <Link
          to="/order-tracking"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="overflow-x-auto flex-1 min-h-0">
        <div className="h-full overflow-y-auto nice-scroll">
          <table className="min-w-full text-sm pro-table">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
              <tr>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
                  Lộ trình
                </th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
                  Giao hàng dự kiến
                </th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {r.id}
                  </td>
                  <td className="px-6 py-4">{r.customer}</td>
                  <td className="px-6 py-4">{r.route}</td>
                  <td className="px-6 py-4">
                    {new Date(r.eta).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs ${
                        STATUS_STYLES[r.status]
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          DOT_STYLES[r.status]
                        }`}
                      ></span>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const AVATAR_TONES = {
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  teal: "bg-teal-100 text-teal-700",
};

function OrderCard({ req, onDetail }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    // reset container for HMR
    if (el._leaflet_id) {
      const container = L.DomUtil.get(el);
      if (container) container._leaflet_id = null;
    }
    const map = L.map(el, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
    });
    mapObj.current = map;
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);
    const hasA = !Number.isNaN(req.latA) && !Number.isNaN(req.lngA);
    const hasB = !Number.isNaN(req.latB) && !Number.isNaN(req.lngB);
    if (hasA)
      L.circleMarker([req.latA, req.lngA], {
        radius: 6,
        weight: 2,
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.9,
      }).addTo(map);
    if (hasB)
      L.circleMarker([req.latB, req.lngB], {
        radius: 6,
        weight: 2,
        color: "#059669",
        fillColor: "#34d399",
        fillOpacity: 0.9,
      }).addTo(map);
    if (hasA && hasB) {
      const b = L.latLngBounds([
        [req.latA, req.lngA],
        [req.latB, req.lngB],
      ]);
      map.fitBounds(b, { padding: [12, 12], maxZoom: 16 });
    } else if (hasA) {
      map.setView([req.latA, req.lngA], 15);
    } else if (hasB) {
      map.setView([req.latB, req.lngB], 15);
    } else {
      map.setView([10.776, 106.7], 12);
    }
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
    };
  }, [req.latA, req.lngA, req.latB, req.lngB]);

  return (
    <article
      className={`rounded-xl p-4 ${
        req.isNew
          ? "border-2 border-amber-300 bg-amber-50/70 relative overflow-hidden"
          : "border border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      {req.isNew && (
        <div className="absolute top-0 right-0 text-xs font-bold text-amber-800 bg-amber-300 px-2 py-0.9 rounded-bl-lg">
          NEW
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="font-semibold text-slate-700">{req.orderCode}</div>
        <div>{req.time}</div>
      </div>
      <div className="mt-2 grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-2 text-sm">
          <div>
            <div className="text-xs text-slate-500">Từ</div>
            <div className="font-medium text-slate-700">{req.from}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đến</div>
            <div className="font-medium text-slate-700">{req.to}</div>
          </div>
        </div>
        <div className="col-span-4">
          <div
            ref={mapRef}
            className="mini-map w-full h-full rounded-lg border border-slate-200"
          />
        </div>
      </div>
      <div
        className={`mt-3 pt-3 ${
          req.isNew ? "border-t border-amber-200" : "border-t border-slate-100"
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center font-semibold text-xs ${
              AVATAR_TONES[req.avatarTone]
            }`}
          >
            {req.initials}
          </div>
          <div className="font-medium text-sm">{req.name}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* BỎ nút Từ chối — chỉ còn Xem chi tiết */}
          <button
            onClick={() =>
              onDetail &&
              onDetail({
                orderId: req.orderCode,
                customer: req.name,
                goods: "—",
                route: `${req.from} → ${req.to}`,
                weight: "—",
                size: "—",
                vehicle: "—",
                desc: "",
                phone: "",
              })
            }
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}

// ---- Search helper (chuẩn hoá để tìm theo ID, bỏ khoảng trắng, không phân biệt hoa-thường)
const norm = (s) =>
  (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();

function OrderRequests({ list = [], onDetail }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const nq = norm(q);
    if (!nq) return list;
    return list.filter((it) => norm(it.orderCode).includes(nq));
  }, [list, q]);

  return (
    <section className="card h-222 flex flex-col min-h-0">
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="font-semibold text-lg">Order Requests</h3>
        <div className="relative flex-1 max-w-xs">
          <i
            data-feather="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          ></i>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm theo ID (ví dụ: ORDERID 0112)"
            aria-label="Tìm kiếm đơn hàng theo ID"
          />
        </div>
      </div>
      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">
        Yêu cầu đặt hàng gần đây
      </div>
      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto nice-scroll space-y-4">
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-500">
            Không tìm thấy đơn hàng phù hợp.
          </div>
        ) : (
          filtered.map((req) => (
            <OrderCard key={req.orderCode} req={req} onDetail={onDetail} />
          ))
        )}
      </div>
      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Map tiles ©{" "}
          <a
            className="underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </div>
        <div className="flex items-center gap-2">
          {/* Giữ các nút tổng nếu bạn vẫn cần — không thuộc yêu cầu bỏ */}
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100">
            Từ chối tất cả
          </button>
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------
// Main page component (single file)
// --------------------------------------
export default function Supplier() {
  const [sheet, setSheet] = useState({ open: false, data: null });

  const openSheet = (data) => {
    setSheet({ open: true, data });
    document.body.style.overflow = "hidden"; // khóa scroll nền (tùy chọn)
  };
  const closeSheet = () => {
    setSheet({ open: false, data: null });
    document.body.style.overflow = ""; // trả lại scroll
  };

  // Feather icons
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="text-slate-800">
      {/* Global styles */}
      <style>{`
        html,body{height:100%}
        body{ background: linear-gradient(180deg,#f8fafc 0%, #eef2f7 60%, #eef2f7 100%); font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; scrollbar-gutter: stable both-edges; }
        .card{ background:#fff; border:1px solid rgb(226 232 240); border-radius:1rem; box-shadow:0 10px 28px rgba(2,6,23,.08) }
        .card, article, button{ transition:all .18s ease; }
        .card:hover{ transform:translateY(-1px); box-shadow:0 16px 40px rgba(2,6,23,.12) }
        .nice-scroll{ scrollbar-width:thin; scrollbar-color:#cbd5e1 #f1f5f9 }
        .nice-scroll::-webkit-scrollbar{ width:10px }
        .nice-scroll::-webkit-scrollbar-track{ background:#f1f5f9; border-radius:9999px }
        .nice-scroll::-webkit-scrollbar-thumb{ background:#c7d2fe; border-radius:9999px; border:3px solid #f8fafc }
        .pro-table tbody tr:nth-child(even){ background:#f8fafc }
        .pro-table tbody tr:hover{ background:#eff6ff }
        .mini-map{ pointer-events:none; }
        .mini-map .leaflet-control-attribution{ display:none; }
        .container-padding { padding-top: clamp(8px, 8px, 18px); } /* giữ nhẹ phần padding top */
        .mini-map{
          position: relative;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          border-radius: 0.5rem;
        }
        .mini-map .leaflet-pane,
        .mini-map .leaflet-tile-pane,
        .mini-map .leaflet-overlay-pane,
        .mini-map .leaflet-shadow-pane,
        .mini-map .leaflet-marker-pane,
        .mini-map .leaflet-tooltip-pane,
        .mini-map .leaflet-popup-pane {
          z-index: 0 !important;
        }
        .mini-map .leaflet-container {
          background: transparent !important;
        }
      `}</style>

      {/* Sidebar & Topbar chung */}
      <Sidebar />
      <Topbar title="Dashboard" />

      {/* MAIN: chừa chỗ cho sidebar chung w-20 */}
      <main id="main" className="ml-20 pt-4">
        <div className="max-w-[120rem] mx-auto p-4 md:p-6 pt-3">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Chào mừng trở lại! Dưới đây là tổng quan trang quản lí của bạn.
                ☀️
              </p>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">
                        Recent Orders
                      </h3>
                      <p className="text-sm text-slate-500">
                        Thống kê đơn hàng trong tháng.
                      </p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Tháng 10
                      <i
                        data-feather="chevron-down"
                        className="w-4 h-4 text-slate-500"
                      ></i>
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-12 gap-4 items-end">
                    <ul className="col-span-12 sm:col-span-5 space-y-4">
                      <li className="flex items-center gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <use href="#i-truck"></use>
                          </svg>
                        </span>
                        <div>
                          <div className="text-sm text-slate-500">
                            Đang hoạt động
                          </div>
                          <div className="font-bold text-xl text-slate-800">
                            720
                          </div>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <use href="#i-clock"></use>
                          </svg>
                        </span>
                        <div>
                          <div className="text-sm text-slate-500">
                            Chờ xác nhận
                          </div>
                          <div className="font-bold text-xl text-slate-800">
                            120
                          </div>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <use href="#i-badge-check"></use>
                          </svg>
                        </span>
                        <div>
                          <div className="text-sm text-slate-500">
                            Đã xác nhận
                          </div>
                          <div className="font-bold text-xl text-slate-800">
                            220
                          </div>
                        </div>
                      </li>
                      <div className="pt-2 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                        <i
                          data-feather="arrow-up-right"
                          className="w-4 h-4"
                        ></i>
                      </div>
                    </ul>
                    <div className="col-span-12 sm:col-span-7">
                      <OrdersAreaMini
                        labels={AREA_CHART.labels}
                        points={AREA_CHART.points}
                        yMin={AREA_CHART.yMin}
                        yMax={AREA_CHART.yMax}
                        yStep={AREA_CHART.yStep}
                      />
                    </div>
                  </div>
                </section>

                <section className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">
                        Fleet Status
                      </h3>
                      <p className="text-sm text-slate-500">
                        Tình trạng các phương tiện.
                      </p>
                    </div>
                    <a
                      href="#"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Xem tất cả
                    </a>
                  </div>
                  <div className="mt-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <div className="relative aspect-square max-w-[190px] mx-auto">
                        <TruckDonutMini
                          labels={DONUT_CHART.labels}
                          values={DONUT_CHART.values}
                          colors={DONUT_CHART.colors}
                        />
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-slate-800">
                              {DONUT_CHART.values.reduce((a, b) => a + b, 0)}
                            </div>
                            <div className="text-slate-500 text-xs tracking-wide">
                              TỔNG SỐ XE
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
                      {DONUT_CHART.labels.map((label, i) => (
                        <li className="flex items-center gap-2" key={label}>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: DONUT_CHART.colors[i] }}
                          />
                          {label}
                          <span className="ml-auto font-semibold">
                            {DONUT_CHART.values[i]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
              <LatestShippingTable rows={LATEST_SHIPPING} />
            </div>

            <aside className="space-y-8 h-full">
              <OrderRequests list={ORDER_REQUESTS} onDetail={openSheet} />
            </aside>
          </div>

          <footer className="text-center text-xs text-slate-500 mt-8">
            © 2025 VT Logistics — Demo UI Tailwind & Chart.js
          </footer>
        </div>
      </main>

      {/* Backdrop */}
      {sheet.open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-[60]"
          onClick={closeSheet}
        />
      )}

      {/* ========= SHEET CHI TIẾT ========= */}
      {sheet.open && (
        <aside className="fixed right-0 top-0 h-full w-full max-w-xl bg-white border-l border-slate-200 rounded-l-2xl overflow-y-auto shadow-2xl z-[70]">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
            <div className="px-5 py-4 flex items-center gap-3">
              <button
                onClick={closeSheet}
                className="inline-flex items-center gap-2 text-slate-600"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="stroke-current"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">Trở lại</span>
              </button>
            </div>
          </div>

          <div className="px-5 md:px-6 py-5">
            <div className="flex items-start md:items-center justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">
                  {sheet.data?.orderId}
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {sheet.data?.customer}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-white border border-slate-300">
                  Từ chối
                </button>
                <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-blue-600 text-white">
                  Chấp nhận
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Tên hàng hóa:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.goods ?? "—"}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Lộ trình:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.route}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Cân nặng đơn hàng:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.weight}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Kích thước:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.size}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Loại xe:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.vehicle}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Mô tả sản phẩm:
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    {sheet.data?.desc}
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">
                    Số điện thoại liên hệ
                  </div>
                  <div className="col-span-7 md:col-span-8 px-4 py-3">
                    <a
                      className="text-blue-600"
                      href={`tel:${sheet.data?.phone || ""}`}
                    >
                      {sheet.data?.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Thông tin được lấy từ yêu cầu đặt hàng của khách.
            </div>
            <div className="h-24" />
          </div>
        </aside>
      )}

      <IconsSprite />
    </div>
  );
}
