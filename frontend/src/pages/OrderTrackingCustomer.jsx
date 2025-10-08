// src/pages/OrderTracking.jsx
import React, { useEffect, useRef } from "react";
import feather from "feather-icons";

export default function OrderTracking() {
  const topbarRef = useRef(null);

  // ===== Helpers =====
  const setTopbarHeight = () => {
    const el = topbarRef.current;
    if (el) {
      document.documentElement.style.setProperty("--topbar-h", el.offsetHeight + "px");
    }
  };

  useEffect(() => {
    // set CSS var for topbar height
    setTopbarHeight();
    window.addEventListener("resize", setTopbarHeight);

    // replace feather icons
    feather.replace({ width: 21, height: 21 });

    return () => {
      window.removeEventListener("resize", setTopbarHeight);
    };
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Global styles moved from <style> in HTML */}
      <style>{`
        :root{ --sidebar-w: 80px; }
        @media (min-width:1024px){ html, body{ overflow: hidden; } }

        .nice-scroll{ scrollbar-width:thin; scrollbar-color:#cbd5e1 #f1f5f9 }
        .nice-scroll::-webkit-scrollbar{ width:10px }
        .nice-scroll::-webkit-scrollbar-track{ background:#f1f5f9; border-radius:9999px }
        .nice-scroll::-webkit-scrollbar-thumb{ background:#c7d2fe; border-radius:9999px; border:3px solid #f8fafc }

        .mini-progress{height:8px;border-radius:9999px;background:#e5edff;position:relative;overflow:hidden}
        .mini-progress > span{position:absolute;inset:0;transform-origin:left center;background:linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)}

        #status ol{ position:relative; padding-left:44px; }
        #status .rail{ position:absolute; left:20px; top:0; bottom:0; width:2px; background:linear-gradient(#93c5fd 0 45%, #e5e7eb 45% 100%); }
        #status li{ position:relative; margin-bottom:12px; }
        #status .dot{ position:absolute; left:14px; top:18px; width:12px; height:12px; border-radius:9999px; background:#fff; border:3px solid #93c5fd; box-shadow:0 0 0 3px #fff }
        #status .dot.done, #status .dot.current{ border-color:#2563eb; background:#2563eb }
        #status .dot.current{ box-shadow:0 0 0 6px rgba(37,99,235,.18) }
        #status .dot.future{ border-color:#cbd5e1; background:#fff }

        /* Status card overrides */
        #statusCard .steps-wrap{ overflow:visible !important; }
        #statusCard .steps-outer{ display:flex; justify-content:center; width:100%; }
        #statusCard .steps{ --nudge: 8px; position:relative; width:100%; max-width:380px; margin:0 auto; padding-left:0; transform: translateX(calc(var(--nudge) * -1)); }
        #statusCard .rail{ position:absolute; left:16px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#93c5fd 0%,#1e66ff 45%,#e5e7eb 45%); }
        #statusCard .steps li{ position:relative; padding-left:48px; margin-bottom:12px; }
        #statusCard .steps li > .dot{ position:absolute; left:9px; top:18px; width:10px; height:10px; border-radius:9999px; background:#fff; border:2px solid #93c5fd; box-shadow:0 0 0 2px #fff; }
        #statusCard .steps li > .dot.done{ background:#1E66FF; border-color:#1E66FF; }
        #statusCard .steps li > .dot.current{ background:#1E66FF; border-color:#1E66FF; box-shadow:0 0 0 4px rgba(30,102,255,.16); }
        #statusCard .steps li > .dot.future{ border-color:#cbd5e1; }
        #statusCard .step-card{ margin-left:0; }
        #statusCard .step-meta{ font-size:12px; }
      `}</style>

      {/* SIDEBAR */}
      <aside
        className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3"
      >
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ">
            <i data-feather="home" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Theo dõi đơn">
            <i data-feather="map" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử">
            <i data-feather="file-text" />
          </button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Tài khoản">
            <i data-feather="user" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      {/* HEADER */}
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
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <i data-feather="filter" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
                <i data-feather="plus" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
                <i data-feather="bell" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
                <i data-feather="archive" />
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
                <i data-feather="chevron-down" className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-[64px] lg:overflow-hidden" style={{ marginLeft: "var(--sidebar-w)" }}>
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* LEFT */}
          <section className="col-span-12 lg:col-span-3">
            {/* giảm offset để mép trên ngang hai khối còn lại */}
            <div className="sticky" style={{ top: "calc(var(--topbar-h,64px) - 55px)" }}>
              <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
                  <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold tracking-tight">ĐƠN HÀNG CỦA BẠN</h3>
                      <span className="text-xs text-slate-500">1 đơn đang theo dõi</span>
                    </div>
                  </div>

                  <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
                          <i data-feather="package" className="w-4 h-4" />
                        </span>
                        <div className="text-sm min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">ORDERID 0112</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-blue-700 ring-1 ring-blue-300">
                              ĐANG VẬN CHUYỂN
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug">
                            279 Nguyễn Tri Phương, Q10 → 777 Lê Lai, Hà Nội
                          </div>
                          <div className="mt-2 mini-progress"><span style={{ transform: "scaleX(.62)" }} /></div>
                        </div>
                      </div>
                      <button
                        title="Theo dõi"
                        className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-blue-600 text-white ring-1 ring-blue-500/30 hover:brightness-105"
                      >
                        <i data-feather="map-pin" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[12px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <i data-feather="clock" className="w-4 h-4" /> Dự kiến: 20/10/2025 16:30
                      </div>
                      <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href="#">
                        <i data-feather="download" className="w-4 h-4" />
                        Hóa đơn
                      </a>
                    </div>
                  </article>

                  <div className="mt-4 p-3 rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-sky-50 to-white">
                    <div className="text-sm font-semibold text-slate-800">Mẹo giao nhận an toàn</div>
                    <ul className="mt-1 text-[12px] text-slate-600 list-disc pl-5 space-y-1">
                      <li>Luôn xác minh mã đơn/OTP khi nhận.</li>
                      <li>Ưu tiên thanh toán không tiền mặt.</li>
                      <li>Kiểm tra niêm phong trước khi ký.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CENTER */}
          <section className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-sm text-slate-500">Đang theo dõi</div>
                  <h2 className="text-xl font-semibold">ORDERID 0112</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-sm inline-flex items-center gap-1">
                    <i data-feather="check-circle" className="w-4 h-4" />
                    Không trễ
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-sm inline-flex items-center gap-1">
                    <i data-feather="clock" className="w-4 h-4" />
                    ETA 3h15’
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-sm inline-flex items-center gap-1">
                    <i data-feather="navigation" className="w-4 h-4" />
                    78 km còn lại
                  </span>
                </div>
              </div>

              <div className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-slate-200 h-[520px]">
                <img
                  src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                  alt="Map"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 900 640"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="120,520 220,470 300,430 370,390 450,350 520,310 590,270 650,230 730,190"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="120" cy="520" r="12" fill="#2563eb" />
                  <circle cx="730" cy="190" r="12" fill="#2563eb" />
                </svg>
                <div className="absolute left-3 bottom-3 bg-white/95 backdrop-blur rounded-xl shadow-soft ring-1 ring-slate-200 p-3 flex items-center gap-3">
                  <img src="https://i.pravatar.cc/48?img=12" className="w-10 h-10 rounded-full" alt="driver" />
                  <div className="text-sm">
                    <div className="font-semibold">Tài xế: Quang Trè</div>
                    <div className="text-xs text-slate-500">Xe tải 6.5T • DL04MP7045</div>
                  </div>
                  <a
                    href="tel:0900000000"
                    className="ml-2 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs inline-flex items-center gap-1"
                  >
                    <i data-feather="phone" className="w-4 h-4" />
                    Gọi
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="col-span-12 lg:col-span-3">
            <div className="sticky" style={{ top: "calc(var(--topbar-h,64px) + 16px)" }}>
              <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="space-y-4">
                  {/* STATUS */}
                  <div
                    id="statusCard"
                    className="bg-white border border-slate-200 rounded-2xl p-3"
                    style={{ height: "var(--map-h)", display: "flex", flexDirection: "column", ["--nudge"]: "8px" }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Status</h3>
                      <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">Làm mới</button>
                    </div>

                    <div className="mt-3 grid grid-cols-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">TP.HCM</span>
                      <span className="text-center">Quảng Ngãi</span>
                      <span className="text-center">Thanh Hóa</span>
                      <span className="text-right">Hà Nội</span>
                    </div>

                    <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
                      <div
                        id="segFill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: "60%",
                          background:
                            "linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25)",
                        }}
                      />
                      <span className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-slate-300 rounded" />
                      <span className="absolute top-1 bottom-1 left-1/2 w-[2px] bg-slate-300 rounded" />
                      <span className="absolute top-1 bottom-1 left-[75%] w-[2px] bg-slate-300 rounded" />
                      <div
                        id="etaPill"
                        className="absolute top-1/2 -translate-y-1/2 right-2 px-2 py-1 rounded-full bg-[#e7f0ff] text-[#0B43C6] text-[12px] font-bold shadow"
                      >
                        12 Hrs Left
                      </div>
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
                                  <i data-feather="clock" className="w-4 h-4" /> Đang xử lý (15’)
                                </span>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-300">
                                  ON TIME
                                </span>
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
                            <span className="dot future" style={{ opacity: ".85" }} />
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

                  {/* HỖ TRỢ */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Hỗ trợ</h3>
                      <span className="text-xs text-slate-500">24/7</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <a
                        href="tel:19001234"
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white inline-flex items-center justify-center gap-2"
                      >
                        <i data-feather="phone" className="w-4 h-4" />
                        Gọi tổng đài
                      </a>
                      <a
                        href="#"
                        className="px-3 py-2 rounded-lg ring-1 ring-slate-200 bg-white inline-flex items-center justify-center gap-2 hover:bg-slate-50"
                      >
                        <i data-feather="message-circle" className="w-4 h-4" />
                        Chat
                      </a>
                    </div>
                  </div>

                  {/* TÓM TẮT */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <h3 className="font-semibold">Tóm tắt</h3>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span>Kiện hàng</span><span className="font-semibold">3</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Khối lượng</span><span className="font-semibold">120 kg</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Phí vận chuyển</span><span className="font-semibold">420.000₫</span>
                      </div>
                      <div className="border-t mt-2 pt-2 flex items-center justify-between">
                        <span className="font-semibold">Tổng thanh toán</span>
                        <span className="font-bold text-slate-900">420.000₫</span>
                      </div>
                    </div>
                  </div>
                  {/* END RIGHT STACK */}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
