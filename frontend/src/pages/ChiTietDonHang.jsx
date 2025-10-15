import React from "react";
import { Shield, Home, Truck, Map as MapIcon, Bell, User, Settings, Search, Filter, Plus, Archive, Calendar, ChevronDown, Download } from "lucide-react";
import OrdersAreaCard from "../components/chi tiet don hàng/OrdersAreaCard";
import FleetDonutCard from "../components/chi tiet don hàng/FleetDonutCard";
import DetailsSheet from "../components/chi tiet don hàng/DetailsSheet";

export default function DashboardPage() {
  return (
    <div
      className="text-slate-800 min-h-screen"
      style={{
        background: "linear-gradient(180deg,#f8fafc 0%, #eef2f7 60%, #eef2f7 100%)",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      {/* styles nội bộ đủ dùng */}
      <style>{`
        :root{ --sidebar-w:80px; }
        .card{ background:#fff; border:1px solid rgb(226 232 240); border-radius:1rem; box-shadow:0 10px 28px rgba(2,6,23,.08) }
        .card, article, button{ transition:all .18s ease; }
        .card:hover{ transform:translateY(-1px); box-shadow:0 16px 40px rgba(2,6,23,.12) }
        .nice-scroll{ scrollbar-width:thin; scrollbar-color:#cbd5e1 #f1f5f9 }
        .nice-scroll::-webkit-scrollbar{ width:10px }
        .nice-scroll::-webkit-scrollbar-track{ background:#f1f5f9; border-radius:9999px }
        .nice-scroll::-webkit-scrollbar-thumb{ background:#c7d2fe; border-radius:9999px; border:3px solid #f8fafc }
        .pro-table tbody tr:nth-child(even){ background:#f8fafc }
        .pro-table tbody tr:hover{ background:#eff6ff }
        .container-padding { padding-top: clamp(8px, calc(var(--topbar-h,64px) - 56px), 18px); }
      `}</style>

      {/* SIDEBAR (inline) */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
        <div className="mt-1 mb-1 text-center select-none">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <Shield size={18} />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Trang chủ">
            <Home size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Quản lý xe">
            <Truck size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi đơn">
            <MapIcon size={18} />
          </button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng">
            <User size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* TOPBAR (inline) */}
      <header
        id="topbar"
        className="fixed top-0 z-50 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/65 bg-gradient-to-l from-blue-900 via-sky-200 to-white shadow-sm"
        style={{ marginLeft: "var(--sidebar-w)", width: "calc(100% - var(--sidebar-w))" }}
      >
        <div className="px-3 md:px-5 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
                <Plus size={18} />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
                <Bell size={18} />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
                <Archive size={18} />
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
                <ChevronDown className="text-slate-400" size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main id="main" className="container-padding" style={{ marginLeft: "var(--sidebar-w)", paddingTop: "var(--topbar-h, 64px)" }}>
        <div className="max-w-[120rem] mx-auto p-4 md:p-6 pt-3">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1">Chào mừng trở lại! Dưới đây là tổng quan trang quản lí của bạn. ☀️</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Date range">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Last 30 days</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50" aria-label="Export">
                <Download className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {/* LEFT */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrdersAreaCard />
                <FleetDonutCard />
              </div>

              {/* LATEST SHIPPING (inline) */}
              <section className="card h-[calc(100vh-180px)] flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Latest Shipping</h3>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
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
                        {[
                          ["#ID12345678","Lương Quang Trè","Vũng Tàu → Đà Nẵng","20/10/2025","Active","emerald"],
                          ["#ID12345679","Công Ty ABC","TP.HCM → Hà Nội","15/10/2025","Delivered","blue"],
                          ["#ID12345680","Nguyễn Văn An","Hải Phòng → Cần Thơ","22/10/2025","Pending","amber"],
                          ["#ID12345681","Trần Thị Bích","Bình Dương → Đồng Nai","18/10/2025","Cancelled","red"],
                          ["#ID12345682","Lê Hữu Phước","Đà Lạt → Nha Trang","25/10/2025","Delivered","blue"],
                          ["#ID12345683","Phạm Gia Hân","Biên Hòa → TP.HCM","08/11/2025","Active","emerald"],
                          ["#ID12345684","Công Ty Rồng Việt","Hà Nội → Đà Nẵng","12/11/2025","Active","emerald"],
                          ["#ID12345685","Hoàng Anh Tuấn","Cà Mau → Bạc Liêu","30/10/2025","Pending","amber"],
                          ["#ID12345686","Ngô Bảo Châu","TP.HCM → Vũng Tàu","02/12/2025","Delivered","blue"],
                          ["#ID12345687","Tập đoàn FPT","Hà Nội → TP.HCM","15/12/2025","Active","emerald"],
                        ].map(([id, name, route, eta, status, color]) => (
                          <tr key={id}>
                            <td className="px-6 py-4 font-medium text-slate-800">{id}</td>
                            <td className="px-6 py-4">{name}</td>
                            <td className="px-6 py-4">{route}</td>
                            <td className="px-6 py-4">{eta}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-${color}-100 text-${color}-800 font-semibold text-xs`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span>
                                {status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT (inline) */}
            <aside className="space-y-8 h-full">
              <section className="card h-[calc(100vh-180px)] flex flex-col min-h-0">
                <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
                  <h3 className="font-semibold text-lg">Order Requests</h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Tìm kiếm đơn hàng" />
                  </div>
                </div>

                <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">Yêu cầu đặt hàng gần đây</div>
                <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto nice-scroll space-y-4">{/* ... */}</div>

                <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Map tiles © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100">Từ chối tất cả</button>
                    <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Chấp nhận tất cả</button>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <footer className="text-center text-xs text-slate-500 mt-8">© 2025 VT Logistics — Demo UI Tailwind & Chart.js</footer>
        </div>
      </main>

      {/* Overlay + Sheet (đặc trưng) */}
      <DetailsSheet.Overlay />
      <DetailsSheet />
    </div>
  );
}
