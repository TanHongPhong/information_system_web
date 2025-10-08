import React, { useEffect } from "react";
import feather from "feather-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";

// NOTE:
// - TailwindCSS should already be set up globally in your project.
// - This page reuses your fixed left sidebar + sticky header layout.
// - Add a route in App.jsx: <Route path="/dashboard" element={<Dashboard />} />

export default function OrderRequestDetails() {
  useEffect(() => {
    // ===== Feather icons =====
    if (feather) feather.replace();

    // ===== Charts =====
    const areaEl = document.getElementById("ordersAreaMini");
    const donutEl = document.getElementById("truckDonutMini");

    let areaChart, donutChart;

    if (areaEl) {
      const ctx = areaEl.getContext("2d");
      const g2 = ctx.createLinearGradient(0, 0, 0, 180);
      g2.addColorStop(0, "rgba(59,130,246,.4)");
      g2.addColorStop(1, "rgba(59,130,246,0)");
      areaChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["01", "05", "10", "15", "20", "25", "30"],
          datasets: [
            {
              data: [20, 45, 80, 110, 145, 170, 190],
              borderColor: "#3b82f6",
              backgroundColor: g2,
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
              min: 0,
              max: 250,
              ticks: { stepSize: 50 },
              grid: { color: "rgba(15,23,42,0.06)" },
              border: { dash: [5, 5] },
            },
          },
        },
      });
    }

    if (donutEl) {
      const ctx2 = donutEl.getContext("2d");
      donutChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: [
            "Đang VC",
            "Nhận hàng delay",
            "Sẵn sàng nhận",
            "Gửi hàng delay",
            "Sẵn sàng gửi",
            "Huỷ",
          ],
          datasets: [
            {
              data: [40, 23, 12, 12, 3, 3],
              backgroundColor: [
                "#0b2875",
                "#ef4444",
                "#2563eb",
                "#60a5fa",
                "#3b82f6",
                "#d97706",
              ],
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
            tooltip: {
              callbacks: {
                label: (c) => `${c.label}: ${c.raw}`,
              },
            },
          },
        },
      });
    }

    // ===== Leaflet mini maps (if any .mini-map exist) =====
    function initMiniMaps() {
      document.querySelectorAll(".mini-map").forEach((el) => {
        // Reset any previous map instance
        if (el._leaflet_id) {
          const container = L.DomUtil.get(el);
          if (container) container._leaflet_id = null;
        }

        const latA = parseFloat(el.dataset.latA);
        const lngA = parseFloat(el.dataset.lngA);
        const latB = parseFloat(el.dataset.latB);
        const lngB = parseFloat(el.dataset.lngB);

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

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 }
        ).addTo(map);

        if (!isNaN(latA) && !isNaN(lngA))
          L.circleMarker([latA, lngA], {
            radius: 6,
            weight: 2,
            color: "#2563eb",
            fillColor: "#60a5fa",
            fillOpacity: 0.9,
          }).addTo(map);

        if (!isNaN(latB) && !isNaN(lngB))
          L.circleMarker([latB, lngB], {
            radius: 6,
            weight: 2,
            color: "#059669",
            fillColor: "#34d399",
            fillOpacity: 0.9,
          }).addTo(map);

        if (!isNaN(latA) && !isNaN(lngA) && !isNaN(latB) && !isNaN(lngB)) {
          const b = L.latLngBounds(
            [
              [latA, lngA],
              [latB, lngB],
            ]
          );
          map.fitBounds(b, { padding: [12, 12], maxZoom: 16 });
        } else if (!isNaN(latA) && !isNaN(lngA)) {
          map.setView([latA, lngA], 15);
        } else if (!isNaN(latB) && !isNaN(lngB)) {
          map.setView([latB, lngB], 15);
        } else {
          map.setView([10.776, 106.7], 12); // HCMC
        }

        setTimeout(() => map.invalidateSize(), 0);
      });
    }

    initMiniMaps();

    // ===== Status icons (SVG <use>) =====
    function mountStatusIcons(root = document) {
      const ICONS = { active: "i-truck", pending: "i-clock", confirmed: "i-badge-check" };
      root.querySelectorAll("[data-status-icon]").forEach((el) => {
        const key = (el.dataset.statusIcon || "").toLowerCase();
        const id = ICONS[key];
        if (!id) return;
        el.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#${id}"></use></svg>`;
      });
    }

    mountStatusIcons();

    // Cleanup on unmount
    return () => {
      if (areaChart) areaChart.destroy();
      if (donutChart) donutChart.destroy();
      // Leaflet maps are attached to DOM nodes; nothing to clean here because we created them on static elements
    };
  }, []);

  return (
    <>
      {/* Local page-only CSS (can be moved to a .css file if you prefer) */}
      <style>{`
        :root{ --sidebar-w:80px; }
        html,body{height:100%}
        body{
          background: linear-gradient(180deg,#f8fafc 0%, #eef2f7 60%, #eef2f7 100%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          scrollbar-gutter: stable both-edges;
        }
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
        .container-padding { padding-top: clamp(8px, calc(var(--topbar-h,64px) - 56px), 18px); }
      `}</style>

      {/* SIDEBAR (fixed) */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
        <div className="mt-1 mb-1 text-center select-none">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield"></i>
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Trang chủ">
            <i data-feather="home"></i>
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Quản lý xe">
            <i data-feather="truck"></i>
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi đơn">
            <i data-feather="map"></i>
          </button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell"></i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng">
            <i data-feather="user"></i>
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <i data-feather="settings"></i>
          </button>
        </div>
      </aside>

      {/* HEADER */}
      <header
        id="topbar"
        className="fixed top-0 z-50 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/65 bg-gradient-to-l from-blue-900 via-sky-200 to-white shadow-sm"
        style={{ marginLeft: "var(--sidebar-w)", width: "calc(100% - var(--sidebar-w))" }}
      >
        <div className="px-3 md:px-5 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <i data-feather="filter"></i>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
                <i data-feather="plus"></i>
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
                <i data-feather="bell"></i>
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
                <i data-feather="archive"></i>
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
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <i data-feather="chevron-down" className="text-slate-400"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        id="main"
        className="container-padding"
        style={{ marginLeft: "var(--sidebar-w)", paddingTop: "var(--topbar-h, 64px)" }}
      >
        <div className="max-w-[120rem] mx-auto p-4 md:p-6 pt-3">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1">
                Chào mừng trở lại! Dưới đây là tổng quan trang quản lí của bạn. ☀️
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl2 bg-white border border-slate-200 hover:bg-slate-50"
                aria-label="Date range"
              >
                <i data-feather="calendar" className="w-4 h-4 text-slate-500"></i>
                <span className="font-medium text-sm">Last 30 days</span>
                <i data-feather="chevron-down" className="w-4 h-4 text-slate-400"></i>
              </button>
              <button className="p-2.5 rounded-xl2 bg-white border border-slate-200 hover:bg-slate-50" aria-label="Export">
                <i data-feather="download" className="w-5 h-5 text-slate-600"></i>
              </button>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {/* LEFT */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Recent Orders</h3>
                      <p className="text-sm text-slate-500">Thống kê đơn hàng trong tháng.</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Tháng 10
                      <i data-feather="chevron-down" className="w-4 h-4 text-slate-500"></i>
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-12 gap-4 items-end">
                    <ul className="col-span-12 sm:col-span-5 space-y-4">
                      <li className="flex items-center gap-3">
                        <span
                          className="grid place-items-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-600"
                          data-status-icon="active"
                        ></span>
                        <div>
                          <div className="text-sm text-slate-500">Đang hoạt động</div>
                          <div className="font-bold text-xl text-slate-800">720</div>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span
                          className="grid place-items-center w-9 h-9 rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                          data-status-icon="pending"
                        ></span>
                        <div>
                          <div className="text-sm text-slate-500">Chờ xác nhận</div>
                          <div className="font-bold text-xl text-slate-800">120</div>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span
                          className="grid place-items-center w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600"
                          data-status-icon="confirmed"
                        ></span>
                        <div>
                          <div className="text-sm text-slate-500">Đã xác nhận</div>
                          <div className="font-bold text-xl text-slate-800">220</div>
                        </div>
                      </li>
                      <div className="pt-2 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                        <i data-feather="arrow-up-right" className="w-4 h-4"></i>
                        <span>+40% so với tháng trước</span>
                      </div>
                    </ul>

                    <div className="col-span-12 sm:col-span-7">
                      <canvas id="ordersAreaMini" height="150" aria-label="Biểu đồ đơn hàng"></canvas>
                    </div>
                  </div>
                </section>

                <section className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Fleet Status</h3>
                      <p className="text-sm text-slate-500">Tình trạng các phương tiện.</p>
                    </div>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                      Xem tất cả
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <div className="relative aspect-square max-w-[190px] mx-auto">
                        <canvas id="truckDonutMini" aria-label="Tình trạng xe"></canvas>
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-slate-800">93</div>
                            <div className="text-slate-500 text-xs tracking-wide">TỔNG SỐ XE</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0b2875]"></span>Đang vận chuyển
                        <span className="ml-auto font-semibold">40</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>Nhận hàng bị trì hoãn
                        <span className="ml-auto font-semibold">23</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>Sẵn sàng nhận hàng
                        <span className="ml-auto font-semibold">12</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#60a5fa]"></span>Gửi hàng bị trì hoãn
                        <span className="ml-auto font-semibold">12</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>Sẵn sàng gửi hàng
                        <span className="ml-auto font-semibold">3</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>Đơn hàng bị huỷ
                        <span className="ml-auto font-semibold">3</span>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>

              {/* LATEST SHIPPING */}
              <section className="card h-[calc(100vh-180px)] flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Latest Shipping</h3>
                  <a href="#" className="text-sm font-medium text-brand-600 hover:underline">
                    Xem tất cả
                  </a>
                </div>

                <div className="overflow-x-auto flex-1 min-h-0">
                  <div className="h-full overflow-y-auto nice-scroll">
                    <table className="min-w-full text-sm pro-table">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
                        <tr>
                          <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Mã đơn hàng</th>
                          <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Khách hàng</th>
                          <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Lộ trình</th>
                          <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Giao hàng dự kiến</th>
                          <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345678</td>
                          <td className="px-6 py-4">Lương Quang Trè</td>
                          <td className="px-6 py-4">Vũng Tàu → Đà Nẵng</td>
                          <td className="px-6 py-4">20/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345679</td>
                          <td className="px-6 py-4">Công Ty ABC</td>
                          <td className="px-6 py-4">TP.HCM → Hà Nội</td>
                          <td className="px-6 py-4">15/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Delivered
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345680</td>
                          <td className="px-6 py-4">Nguyễn Văn An</td>
                          <td className="px-6 py-4">Hải Phòng → Cần Thơ</td>
                          <td className="px-6 py-4">22/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345681</td>
                          <td className="px-6 py-4">Trần Thị Bích</td>
                          <td className="px-6 py-4">Bình Dương → Đồng Nai</td>
                          <td className="px-6 py-4">18/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Cancelled
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345682</td>
                          <td className="px-6 py-4">Lê Hữu Phước</td>
                          <td className="px-6 py-4">Đà Lạt → Nha Trang</td>
                          <td className="px-6 py-4">25/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Delivered
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345683</td>
                          <td className="px-6 py-4">Phạm Gia Hân</td>
                          <td className="px-6 py-4">Biên Hòa → TP.HCM</td>
                          <td className="px-6 py-4">08/11/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345684</td>
                          <td className="px-6 py-4">Công Ty Rồng Việt</td>
                          <td className="px-6 py-4">Hà Nội → Đà Nẵng</td>
                          <td className="px-6 py-4">12/11/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345685</td>
                          <td className="px-6 py-4">Hoàng Anh Tuấn</td>
                          <td className="px-6 py-4">Cà Mau → Bạc Liêu</td>
                          <td className="px-6 py-4">30/10/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345686</td>
                          <td className="px-6 py-4">Ngô Bảo Châu</td>
                          <td className="px-6 py-4">TP.HCM → Vũng Tàu</td>
                          <td className="px-6 py-4">02/12/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Delivered
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-800">#ID12345687</td>
                          <td className="px-6 py-4">Tập đoàn FPT</td>
                          <td className="px-6 py-4">Hà Nội → TP.HCM</td>
                          <td className="px-6 py-4">15/12/2025</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <aside className="space-y-8 h-full">
              <section className="card h-[calc(100vh-180px)] flex flex-col min-h-0">
                <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
                  <h3 className="font-semibold text-lg">Order Requests</h3>
                  <div className="relative flex-1 max-w-xs">
                    <i
                      data-feather="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    ></i>
                    <input
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      placeholder="Tìm kiếm đơn hàng"
                    />
                  </div>
                </div>

                <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">
                  Yêu cầu đặt hàng gần đây
                </div>

                <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto nice-scroll space-y-4">
                  {/* giữ nguyên các article / TODO: add your items here */}
                </div>

                <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Map tiles ©
                    <a
                      className="underline ml-1"
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noreferrer"
                    >
                      OpenStreetMap
                    </a>{" "}
                    contributors.
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100">
                      Từ chối tất cả
                    </button>
                    <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                      Chấp nhận tất cả
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <footer className="text-center text-xs text-slate-500 mt-8">
            © 2025 VT Logistics — Demo UI Tailwind & Chart.js
          </footer>
        </div>
      </main>

      {/* ========= OVERLAY ========= */}
      <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[2px]"></div>

      {/* ========= SHEET CHI TIẾT ========= */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-xl bg-white border-l border-slate-200 rounded-l-2xl overflow-y-auto shadow-2xl z-[70]">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="px-5 py-4 flex items-center gap-3">
            <button className="inline-flex items-center gap-2 text-slate-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current">
                <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">Trở lại</span>
            </button>
          </div>
        </div>

        <div className="px-5 md:px-6 py-5">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">ORDERID 0112</div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Lương Quang Trè</h2>
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
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Tên hàng hóa:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">Hải sản đông lạnh</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Lộ trình:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">Vũng Tàu → Đà Nẵng</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Cân nặng đơn hàng:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">96kg</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Kích thước:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">100×40×60</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Loại xe:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">Xe container 20feet</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Mô tả sản phẩm:</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">Hàng đông lạnh, dễ vỡ, tránh xóc, chèn ép</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">Số điện thoại liên hệ</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">
                  <a className="text-blue-600">0919345623</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">Thông tin được lấy từ yêu cầu đặt hàng của khách.</div>
          <div className="h-24"></div>
        </div>
      </aside>

      {/* SVG ICONS (symbols used by data-status-icon) */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
        <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H2v12h3m0 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0z" />
          <path d="M22 17H14a2 2 0 1 0-4 0h3m-1-12l-3-4h5l3 4" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </symbol>
        <symbol id="i-badge-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l1.42 1.42a1 1 0 0 0 1.41 0l1.42-1.42a4 4 0 1 1 5.66 5.66l-1.42 1.42a1 1 0 0 0 0 1.41l1.42 1.42a4 4 0 1 1-5.66 5.66l-1.42-1.42a1 1 0 0 0-1.41 0l-1.42 1.42a4 4 0 1 1-5.66-5.66l1.42-1.42a1 1 0 0 0 0-1.41L3.85 8.62z" />
          <path d="m9 12 2 2 4-4" />
        </symbol>
      </svg>
    </>
  );
}
