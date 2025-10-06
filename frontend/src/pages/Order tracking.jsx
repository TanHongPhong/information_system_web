import React, { useEffect, useRef, useState } from "react";
import feather from "feather-icons";

export default function TheoDoiDonHang() {
  const topbarRef = useRef(null);

  // % tiến độ demo
  const [progress, setProgress] = useState(0.6);
  const shipIds = ["0124", "0125", "0126", "0127", "0128", "0129", "0130", "0131", "0132", "0133"];

  // Cập nhật biến CSS --topbar-h theo chiều cao topbar
  useEffect(() => {
    const setTopbarHeight = () => {
      const h = topbarRef.current?.offsetHeight ?? 56;
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };
    setTopbarHeight();
    window.addEventListener("resize", setTopbarHeight);
    return () => window.removeEventListener("resize", setTopbarHeight);
  }, []);

  // Kích hoạt feather icons sau khi render
  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  });

  const handleNav = (href) => (e) => {
    e.preventDefault();
    window.location.href = href;
  };

  const statusBarStyle = { width: `${progress * 100}%` };
  const etaBubbleStyle = { right: `max(8px, calc(100% - ${progress * 100}% + 8px))` };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* CSS gốc trong <style> */}
      <style>{`
        body{font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}
        .dash-marker{ position:absolute; width:3px; top:-10px; bottom:-10px; border-radius:2px;
          background-image:repeating-linear-gradient(to bottom, rgba(100,116,139,.95) 0 12px, transparent 12px 18px);
          filter: drop-shadow(0 0 1px rgba(15,23,42,.25)); pointer-events:none; }
        .order-scroll{ scrollbar-width:thin; scrollbar-color:rgba(2,6,23,.35) transparent; }
        .order-scroll::-webkit-scrollbar{ width:8px; }
        .order-scroll::-webkit-scrollbar-thumb{ background:rgba(2,6,23,.18); border-radius:8px; }
        .order-scroll:hover::-webkit-scrollbar-thumb{ background:rgba(2,6,23,.35); }
        @media (min-width:1024px){ html, body{ overflow:hidden; } }

        /* Tooltip cho sidebar */
        .tip{position:absolute;left:62px;top:50%;transform:translateY(-50%);
          padding:6px 10px;background:#111827;color:#fff;font-size:12px;line-height:1;
          border-radius:8px;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.18);
          opacity:0;pointer-events:none;transition:opacity .18s, transform .18s}
        .group:hover .tip{opacity:1;transform:translateY(-50%) translateX(4px)}
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4 z-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100 group relative"
            data-home="true"
            data-nav="home"
            aria-label="Trang chủ"
            onClick={handleNav("demo5.html")}
          >
            <i data-feather="home" />
            <span className="tip">Trang chủ</span>
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100 group relative"
            data-nav="track"
            aria-label="Theo dõi đơn hàng"
            onClick={handleNav("theo doi don hang.html")}
          >
            <i data-feather="map" />
            <span className="tip">Theo dõi đơn hàng</span>
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100 group relative"
            data-nav="history"
            aria-label="Lịch sử giao dịch"
            onClick={handleNav("lich su giao dich.html")}
          >
            <i data-feather="file-text" />
            <span className="tip">Lịch sử giao dịch</span>
          </button>

          <button className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" aria-label="Thông báo">
            <i data-feather="bell" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" aria-label="Người dùng">
            <i data-feather="user" />
          </button>
          <button className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100" aria-label="Cài đặt">
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      <main className="ml-24 lg:overflow-hidden">
        {/* Topbar */}
        <div
          id="topbar"
          ref={topbarRef}
          className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white/90 backdrop-blur-sm border-b border-slate-200"
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-blue-50 text-slate-900 ring-1 ring-blue-100 shadow-sm hover:bg-blue-100"
          >
            <img
              src="https://i.pravatar.cc/40?img=8"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="font-semibold">Khách hàng A</span>
            <span className="text-slate-300">•</span>
            <i data-feather="chevron-down" className="w-4 h-4 opacity-80 group-hover:opacity-100" />
          </button>
        </div>

        {/* Lưới 3 cột */}
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* CỘT TRÁI: ORDER SEARCH */}
          <section className="col-span-12 lg:col-span-3">
            <div className="sticky top-[calc(var(--topbar-h,56px)+16px)]">
              <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,56px)-2rem)] overflow-y-auto pr-1">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
                  {/* Sticky header trong card */}
                  <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold tracking-tight">ORDER SEARCH</h3>
                      <div className="relative flex-1">
                        <input
                          className="h-9 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Tìm kiếm"
                        />
                        <i data-feather="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Active</button>
                      <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Arriving</button>
                      <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Departed</button>
                    </div>
                  </div>

                  {/* LIST */}
                  <div className="mt-3 space-y-3">
                    {/* Item active */}
                    <article className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                          <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF]">
                            <i data-feather="truck" className="w-4.5 h-4.5" />
                          </span>
                          <div className="text-sm min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <a href="#" className="font-semibold text-slate-800">
                                ShipID-0123
                              </a>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#1E66FF]">Arriving</span>
                            </div>
                            <div className="text-[11px] text-slate-500 leading-snug">
                              <div>DL04MP7045</div>
                              <div className="whitespace-nowrap">Tải trọng tối đa 6.5 tấn</div>
                            </div>
                          </div>
                        </div>
                        <button
                          title="Đang theo dõi"
                          className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#1E66FF] text-white ring-1 ring-blue-500/30 hover:brightness-105"
                        >
                          <i data-feather="eye" className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Departure: TP.Hồ Chí Minh
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Stop 01: Quảng Ngãi
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Stop 02: Thanh Hóa
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Arrival: Hà Nội
                            </li>
                          </ul>
                        </div>
                        <div className="col-span-4">
                          <img
                            src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                            alt="Mini map"
                            className="w-full h-20 rounded-lg object-cover border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://i.pravatar.cc/24?img=12" alt="user" className="w-6 h-6 rounded-full" />
                          <span className="text-[11px] text-slate-500">
                            Shipper&apos;s ID <span className="font-medium text-slate-700">:Drive-012345</span>
                          </span>
                        </div>
                        <button
                          className="w-7 h-7 rounded-full grid place-items-center border border-slate-200 bg-white hover:bg-slate-50"
                          title="Gọi"
                        >
                          <i data-feather="phone" className="w-4.5 h-4.5 text-slate-600" />
                        </button>
                      </div>
                      <div className="mt-2 text-right">
                        <a href="#" className="text-[11px] text-blue-600 hover:underline">
                          Chi tiết
                        </a>
                      </div>
                    </article>

                    {/* Các items tạo từ danh sách */}
                    <div id="list-more" className="space-y-3">
                      {shipIds.map((id) => (
                        <article key={id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-50 text-[#1E66FF]">
                                <i data-feather="truck" className="w-4.5 h-4.5" />
                              </span>
                              <div className="text-sm">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a href="#" className="font-semibold text-slate-800">
                                    {`ShipID-${id}`}
                                  </a>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#1E66FF]">Arriving</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-snug">
                                  <div>DL04MP7045</div>
                                  <div>Tải trọng tối đa 6.5 tấn</div>
                                </div>
                              </div>
                            </div>
                            <button
                              title="Theo dõi"
                              className="shrink-0 w-8 h-8 rounded-md grid place-items-center ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              <i data-feather="eye" className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-right">
                            <a className="text-[11px] text-blue-600 hover:underline" href="#">
                              Chi tiết
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CỘT GIỮA: SHIPMENT */}
          <section className="col-span-12 lg:col-span-6">
            <div id="shipmentCard" className="bg-white border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Shipment ID</div>
                  <h2 className="text-xl font-semibold">SHIPID-0123</h2>
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1E66FF] ring-1 ring-blue-100 hover:bg-blue-100">
                  <i data-feather="book" className="w-4.5 h-4.5" />
                  <span className="text-sm font-medium">Documentation</span>
                </button>
              </div>

              <div className="mt-3 relative rounded-xl overflow-hidden ring-1 ring-slate-200 h-[520px]">
                <img
                  src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                  alt="Map"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 640" preserveAspectRatio="none">
                  <polyline
                    points="140,520 210,465 290,410 350,370 420,330 490,290 560,250 620,220 690,190 760,160"
                    fill="none"
                    stroke="#1E66FF"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="140" cy="520" r="12" fill="#1E66FF" />
                  <circle cx="760" cy="160" r="12" fill="#1E66FF" />
                </svg>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI: STATUS + VEHICLE */}
          <section id="rightCol" className="col-span-12 lg:col-span-3">
            <div className="sticky top-[calc(var(--topbar-h,56px)+16px)]">
              <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,56px)-2rem)] overflow-y-auto pr-1">
                <div className="space-y-4">
                  {/* STATUS */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Status</h3>
                      <button
                        id="btnRefresh"
                        className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm"
                        onClick={() => setProgress((p) => (p >= 0.95 ? 0.1 : Math.min(0.95, p + 0.1)))}
                      >
                        Làm mới
                      </button>
                    </div>
                    {/* labels */}
                    <ol className="mt-3 grid grid-cols-4 text-xs text-slate-600">
                      <li>TP.Hồ Chí Minh</li>
                      <li className="text-center">Quảng Ngãi</li>
                      <li className="text-center">Thanh Hóa</li>
                      <li className="text-right">Hà Nội</li>
                    </ol>
                    {/* progress */}
                    <div className="mt-2 relative h-6 rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      <div
                        id="statusProgress"
                        className="absolute left-0 top-0 h-full rounded-2xl bg-gradient-to-r from-[#0B43C6] via-[#2F78FF] to-[#8AB8FF] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
                        style={statusBarStyle}
                      />
                      {/* checkpoints */}
                      <span className="absolute top-1/2 -translate-y-1/2 left-0 -ml-0.5 w-px h-6 bg-slate-400/70 rounded" />
                      <span className="absolute top-1/2 -translate-y-1/2 left-1/3 -ml-0.5 w-px h-6 bg-slate-400/70 rounded" />
                      <span className="absolute top-1/2 -translate-y-1/2 left-2/3 -ml-0.5 w-px h-6 bg-slate-400/70 rounded" />
                      <span className="absolute top-1/2 -translate-y-1/2 right-0 -mr-0.5 w-px h-6 bg-slate-400/70 rounded" />
                      {/* ETA bubble */}
                      <div
                        id="etaBubble"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-200/70 text-slate-800 text-[13px] font-medium"
                        style={etaBubbleStyle}
                      >
                        12 Hrs Left
                      </div>
                    </div>
                    {/* times */}
                    <ol className="mt-2 grid grid-cols-4 text-[11px] text-slate-500">
                      <li>08:15</li>
                      <li className="text-center">11:40</li>
                      <li className="text-center">19:10</li>
                      <li className="text-right">ETA 02:40</li>
                    </ol>
                  </div>

                  {/* Vehicle details */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Vehicle Details</h3>
                      <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">
                        Xem thông tin công ty
                      </button>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-full ring-1 ring-slate-200 grid place-items-center">
                        <span className="text-[10px] font-semibold text-slate-500">LOGO</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Container 1000KG</div>
                        <div className="text-[12px] text-slate-500">
                          Biển số: <span className="text-slate-700">50AĐ-767.72</span>
                        </div>
                        <div className="text-[12px] text-slate-500">
                          Shipment ID: <span className="text-slate-700">SHIP001234</span>
                        </div>
                        <div className="text-[12px] text-slate-500">
                          Mã đơn hàng: <span className="text-slate-700">DL04MP7045</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl ring-1 ring-slate-200 overflow-hidden bg-white">
                      <img
                        src="https://png.pngtree.com/background/20250120/original/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-picture-image_13354856.jpg"
                        alt="Truck"
                        className="block w-full h-auto object-contain bg-white"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                      <div>
                        Trọng tải <span className="font-semibold text-slate-800">6.5 tấn</span>
                      </div>
                      <div className="text-right">
                        Chiều rộng hàng <span className="font-semibold text-slate-800">4.8 mét</span>
                      </div>
                      <div>
                        Thể tích hàng <span className="font-semibold text-slate-800">35,393 lít</span>
                      </div>
                      <div className="text-right">
                        Chiều dài hàng <span className="font-semibold text-slate-800">11.7 mét</span>
                      </div>
                    </div>
                  </div>
                  {/* /Vehicle details */}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
