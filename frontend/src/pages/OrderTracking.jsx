// src/pages/OrderTracking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";
import { Link } from "react-router-dom";

export default function OrderTracking() {
  // ======= Mock data =======
  const extraShipIds = useMemo(
    () => ["0124","0125","0126","0127","0128","0129","0130","0131","0132","0133"],
    []
  );

  const [progress, setProgress] = useState(0.6); // 60% tiến độ
  const topbarRef = useRef(null);
  const mapBoxRef = useRef(null);

  // ======= Helpers =======
  const setCSSVar = (name, value) =>
    document.documentElement.style.setProperty(name, value);

  const syncTopbarAndMap = () => {
    if (topbarRef.current) {
      setCSSVar("--topbar-h", `${topbarRef.current.offsetHeight}px`);
    }
    if (mapBoxRef.current) {
      setCSSVar("--map-h", `${mapBoxRef.current.offsetHeight}px`);
    }
  };

  useEffect(() => {
    // Render feather icons sau khi DOM đã có <i data-feather="...">
    feather.replace({ width: 18, height: 18 });
    syncTopbarAndMap();

    const onResize = () => {
      syncTopbarAndMap();
      feather.replace({ width: 18, height: 18 });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Khi progress đổi, icon vẫn giữ đúng kích thước
    feather.replace({ width: 18, height: 18 });
  }, [progress]);

  const etaRight = `max(8px, calc(100% - ${progress * 100}% + 8px))`;

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Inline CSS giữ nguyên tinh chỉnh của file HTML gốc */}
      <style>{`
        :root{ --sidebar-w: 80px; }
        body{font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}
        .order-scroll{ scrollbar-width: thin; scrollbar-color: rgba(2,6,23,.35) transparent; }
        .order-scroll::-webkit-scrollbar{ width: 8px; }
        .order-scroll::-webkit-scrollbar-thumb{ background: rgba(2,6,23,.18); border-radius: 8px; }
        .order-scroll:hover::-webkit-scrollbar-thumb{ background: rgba(2,6,23,.35); }
        @media (min-width:1024px){ html, body{ overflow: hidden; } }

        .seg-bar{position:relative;height:30px;border-radius:9999px;background:#ecf2ff; box-shadow:inset 0 1px 0 rgba(255,255,255,.6);}
        .seg-fill{position:absolute;inset:0;border-radius:9999px;
                  background:linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%);
                  box-shadow:inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25);}
        .seg-tick{position:absolute;top:4px;bottom:4px;width:2px;background:#cbd5e1;border-radius:2px}
        .seg-tick.t1{left:25%}.seg-tick.t2{left:50%}.seg-tick.t3{left:75%}
        .eta-pill{position:absolute;top:50%;transform:translateY(-50%);
                  padding:.3rem .7rem;border-radius:9999px;background:#e7f0ff;color:#0B43C6;
                  font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 6px 16px rgba(30,102,255,.20)}

        #statusCard ol{ position:relative; padding-left:44px; }
        #statusCard .rail{ position:absolute; left:18px; top:0; bottom:0; width:2px;
                           background:linear-gradient(to bottom,#93c5fd 0%,#1e66ff 45%,#e5e7eb 45%); }
        #statusCard .dot{ position:absolute; left:11px; top:22px; width:14px; height:14px; border-radius:9999px;
                          background:#fff; border:3px solid #93c5fd; box-shadow:0 0 0 3px #fff }
        #statusCard .dot.done{background:#1E66FF;border-color:#1E66FF}
        #statusCard .dot.current{background:#1E66FF;border-color:#1E66FF; box-shadow:0 0 0 6px rgba(30,102,255,.15)}
        #statusCard .dot.future{border-color:#cbd5e1}

        #statusCard .step-card{ margin-left:40px; }
        #statusCard .step-card:hover{ box-shadow:0 10px 24px rgba(15,23,42,.08) }
        #statusCard .step-meta{ font-size:12px; }

        .card{border-radius:16px; box-shadow:0 8px 24px rgba(15,23,42,.08)}
        .badge{font-size:10px; padding:.15rem .45rem; border-radius:9999px; letter-spacing:.3px;}
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Link to="/" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ"><i data-feather="home" /></Link>
          <Link to="/order-tracking" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><i data-feather="map" /></Link>
          <Link to="/warehouse" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch"><i data-feather="file-text" /></Link>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><i data-feather="user" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><i data-feather="settings" /></button>
        </div>
      </aside>

      {/* Header */}
      <header
        id="topbar"
        ref={topbarRef}
        className="fixed top-0 z-40 border-b md:py-1 bg-white/95 backdrop-blur bg-gradient-to-l from-blue-900 via-sky-200 to-white"
        style={{ marginLeft: "var(--sidebar-w)", width: "calc(100% - var(--sidebar-w))" }}
      >
        <div className="px-3 md:px-5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
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
        </div>
      </header>

      {/* Main */}
      <main className="pt-[64px] lg:overflow-hidden" style={{ marginLeft: "var(--sidebar-w)" }}>
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* LEFT: Order search */}
          <section className="col-span-12 lg:col-span-3">
            <div className="sticky [top:calc(var(--topbar-h,64px)+16px)]">
              <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
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

                  {/* First featured item */}
                  <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF]">
                          <i data-feather="truck" className="w-4.5 h-4.5" />
                        </span>
                        <div className="text-sm min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">ShipID-0123</span>
                            <span className="badge bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70">ARRIVING</span>
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
                          <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Departure: TP.Hồ Chí Minh</li>
                          <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Stop 01: Quảng Ngãi</li>
                          <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Stop 02: Thanh Hóa</li>
                          <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Arrival: Hà Nội</li>
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
                  </article>

                  {/* Extra list items */}
                  <div className="mt-3 space-y-3">
                    {extraShipIds.map((id) => (
                      <article key={id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-50 text-[#1E66FF]">
                              <i data-feather="truck" className="w-4.5 h-4.5" />
                            </span>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-800">{`ShipID-${id}`}</span>
                                <span className="badge bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70">ARRIVING</span>
                              </div>
                              <div className="text-[11px] text-slate-500 leading-snug">
                                <div>DL04MP7045</div>
                                <div>Tải trọng tối đa 6.5 tấn</div>
                              </div>
                            </div>
                          </div>
                          <button title="Theo dõi" className="shrink-0 w-8 h-8 rounded-md grid place-items-center ring-1 ring-slate-200 hover:bg-slate-50">
                            <i data-feather="eye" className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-right">
                          <button className="text-[11px] text-blue-600 hover:underline">Chi tiết</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CENTER: Map */}
          <section className="col-span-12 lg:col-span-6">
            <div id="shipmentCard" className="bg-white border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Shipment ID</div>
                  <h2 className="text-xl font-semibold">SHIPID-0123</h2>
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1E66FF] ring-1 ring-blue-100 hover:bg-blue-100">
                  <i data-feather="book" className="w-4.5 h-4.5" /><span className="text-sm font-medium">Documentation</span>
                </button>
              </div>

              <div
                id="mapBox"
                ref={mapBoxRef}
                className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-slate-200 h-[520px]"
              >
                <img
                  src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                  alt="Map"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 640" preserveAspectRatio="none">
                  <polyline
                    points="140,520 210,465 290,410 350,370 420,330 490,290 560,250 620,220 690,190 760,160"
                    fill="none" stroke="#1E66FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <circle cx="140" cy="520" r="12" fill="#1E66FF" />
                  <circle cx="760" cy="160" r="12" fill="#1E66FF" />
                </svg>
              </div>
            </div>
          </section>

          {/* RIGHT: Status + Vehicle */}
          <section className="col-span-12 lg:col-span-3">
            <div className="sticky [top:calc(var(--topbar-h,64px)+16px)]">
              <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="space-y-4">
                  {/* STATUS */}
                  <div id="statusCard" className="bg-white border border-slate-200 rounded-2xl p-3" style={{ height: "var(--map-h)", display: "flex", flexDirection: "column" }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Status</h3>
                      <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm" onClick={() => setProgress((p) => Math.min(1, Math.max(0, p + 0.05)))}>
                        Làm mới
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">TP.HCM</span>
                      <span className="text-center">Quảng Ngãi</span>
                      <span className="text-center">Thanh Hóa</span>
                      <span className="text-right">Hà Nội</span>
                    </div>

                    <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
                      <div className="seg-fill" style={{ width: `${progress * 100}%` }} />
                      <span className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-slate-300 rounded" />
                      <span className="absolute top-1 bottom-1 left-1/2 w-[2px] bg-slate-300 rounded" />
                      <span className="absolute top-1 bottom-1 left-[75%] w-[2px] bg-slate-300 rounded" />
                      <div className="eta-pill" style={{ right: etaRight }}>12 Hrs Left</div>
                    </div>

                    <div className="mt-3 steps-wrap pr-1">
                      <div className="steps-outer">
                        <ol className="steps">
                          <li>
                            <span className="dot done" />
                            <div className="card step-card ring-1 ring-slate-200 bg-white p-3 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-900 font-semibold">Departure</span>
                                <span className="inline-flex items-center gap-1 step-meta text-slate-600">
                                  <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 10:00
                                </span>
                              </div>
                              <div className="mt-1 step-meta text-slate-600">
                                279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM
                              </div>
                            </div>
                          </li>

                          <li>
                            <span className="dot current" />
                            <div className="card step-card ring-1 ring-blue-200 bg-blue-50/60 p-3 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-900 font-semibold">Stop</span>
                                <span className="inline-flex items-center gap-1 step-meta text-slate-700">
                                  <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 12:00
                                </span>
                              </div>
                              <div className="mt-1 step-meta text-slate-700">76 Nguyễn Tất Thành, Quảng Ngãi</div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white text-blue-700 ring-1 ring-blue-300 inline-flex items-center gap-1">
                                  <i data-feather="clock" className="w-3.5 h-3.5" /> Đang xử lý (15’)
                                </span>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-300">ON TIME</span>
                              </div>
                            </div>
                          </li>

                          <li>
                            <span className="dot future" />
                            <div className="card step-card ring-1 ring-slate-200 bg-white p-3 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-800 font-semibold">Stop</span>
                                <span className="inline-flex items-center gap-1 step-meta text-slate-500">
                                  <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 20:00
                                </span>
                              </div>
                              <div className="mt-1 step-meta text-slate-600">36 Phạm Văn Đồng, Thanh Hóa</div>
                            </div>
                          </li>

                          <li>
                            <span className="dot future" style={{ opacity: 0.85 }} />
                            <div className="card step-card ring-1 ring-slate-200 bg-slate-50 p-3 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-semibold">Arrival</span>
                                <span className="inline-flex items-center gap-1 step-meta text-slate-500">
                                  <i data-feather="calendar" className="w-4 h-4" /> 21/7/2024, 10:00
                                </span>
                              </div>
                              <div className="mt-1 step-meta text-slate-500">777 Lê Lợi, P.3, Q.1, TP.Hà Nội</div>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Scoped CSS cho Status */}
                  <style>{`
                    #statusCard .steps-wrap{ overflow:visible !important; }
                    #statusCard .steps-outer{ display:flex; justify-content:center; width:100%; }
                    #statusCard .steps{
                      --nudge: 8px;
                      position:relative;
                      width:100%;
                      max-width:380px;
                      margin:0 auto;
                      padding-left:0;
                      transform: translateX(calc(var(--nudge) * -1));
                    }
                    #statusCard .rail{
                      position:absolute; left:16px; top:0; bottom:0; width:2px;
                      background:linear-gradient(to bottom,#93c5fd 0%,#1e66ff 45%,#e5e7eb 45%);
                    }
                    #statusCard .steps li{
                      position:relative;
                      padding-left:48px;
                      margin-bottom:12px;
                    }
                    #statusCard .steps li > .dot{
                      position:absolute; left:9px; top:18px;
                      width:10px; height:10px; border-radius:9999px;
                      background:#fff; border:2px solid #93c5fd; box-shadow:0 0 0 2px #fff;
                    }
                    #statusCard .steps li > .dot.done{ background:#1E66FF; border-color:#1E66FF; }
                    #statusCard .steps li > .dot.current{ background:#1E66FF; border-color:#1E66FF; box-shadow:0 0 0 4px rgba(30,102,255,.16); }
                    #statusCard .steps li > .dot.future{ border-color:#cbd5e1; }
                    #statusCard .step-card{ margin-left:0; }
                    #statusCard .step-meta{ font-size:12px; }
                  `}</style>

                  {/* VEHICLE */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Vehicle Details</h3>
                      <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">Xem thông tin công ty</button>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-full ring-1 ring-slate-200 grid place-items-center">
                        <span className="text-[10px] font-semibold text-slate-500">LOGO</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Container 1000KG</div>
                        <div className="text-[12px] text-slate-500">Biển số: <span className="text-slate-700">50AĐ-767.72</span></div>
                        <div className="text-[12px] text-slate-500">Shipment ID: <span className="text-slate-700">SHIP001234</span></div>
                        <div className="text-[12px] text-slate-500">Mã đơn hàng: <span className="text-slate-700">DL04MP7045</span></div>
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
                      <div>Trọng tải <span className="font-semibold text-slate-800">6.5 tấn</span></div>
                      <div className="text-right">Chiều rộng hàng <span className="font-semibold text-slate-800">4.8 mét</span></div>
                      <div>Thể tích hàng <span className="font-semibold text-slate-800">35,393 lít</span></div>
                      <div className="text-right">Chiều dài hàng <span className="font-semibold text-slate-800">11.7 mét</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
