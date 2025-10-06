// QrPayment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";

export default function QrPayment({
  amount = 10_000_000,
  companyName = "Công ty Gemadept",
  orderId = "322138483848",
  orderDesc = "Xe container 4000kg, lộ trình TP.HCM → Hà Nội, ngày lấy hàng: 17/10/2025",
  qrSrc = "/qr.jpg", // để ảnh trong public/qr.jpg
}) {
  // ==== STATE ====
  const [remain, setRemain] = useState(15 * 60); // giây
  const [status, setStatus] = useState("pending"); // pending | success | expired
  const [successBar, setSuccessBar] = useState(false);
  const [orderTime, setOrderTime] = useState("—");
  const [activeMethod, setActiveMethod] = useState(null); // 'momo' | 'vietqr' | 'zalo'
  const [toastMsg, setToastMsg] = useState("");

  // ==== HELPERS ====
  const fmtCurrency = (v) =>
    Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

  const mmss = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ==== EFFECTS ====
  // Feather icons initial (header/sidebar size 21) + subsequent refresh (content size 18)
  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, []);
  useEffect(() => {
    feather.replace({ width: 18, height: 18 });
  });

  // Countdown
  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Khi hết giờ → expired
  useEffect(() => {
    if (remain === 0 && status === "pending") {
      setStatus("expired");
    }
  }, [remain, status]);

  // Fake payment success sau 9s (theo bản gốc)
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus("success");
      setSuccessBar(true);
      setOrderTime(new Date().toLocaleString("vi-VN"));
    }, 9000);
    return () => clearTimeout(t);
  }, []); // chỉ chạy 1 lần lúc mount (giống code gốc)

  // Toast auto-hide
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 1600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // ==== ACTIONS ====
  const onDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "gemadept-vietqr.jpg";
    a.click();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMsg("Đã copy vào clipboard");
    } catch {
      setToastMsg("Không copy được.");
    }
  };

  const onRefresh = () => {
    setRemain(15 * 60);
    setStatus("pending");
    setSuccessBar(false);
  };

  const onCancel = () => setToastMsg("Bạn đã huỷ thanh toán (demo).");
  const onSupport = () => setToastMsg("Đã mở kênh hỗ trợ (demo).");

  // ==== DERIVED ====
  const note = `GMD-${orderId}`;
  const qrPayload = `VIETQR|GEMADEPT|${amount}|${note}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Local styles */}
      <style>{`
        html, body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        :is(button,a,select,input,details,summary):focus-visible{outline:2px solid #2563eb;outline-offset:2px}
        .card-line{height:1px;background:linear-gradient(90deg,#e8e8e8,#f6f6f6 60%,#ffffff)}
        .qr-grad{background:linear-gradient(150deg,#7dd3fc 0%, #e0e7ff 40%, #ffffff 100%)}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        #order-id{font-variant-numeric:tabular-nums;display:inline-block;line-height:1.45}
      `}</style>

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ">
            <i data-feather="home" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí">
            <i data-feather="map" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch">
            <i data-feather="file-text" />
          </a>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng">
            <i data-feather="user" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <i data-feather="settings" />
          </a>
        </div>
      </aside>

      <main className="ml-20">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm giao dịch, mã đơn, số tiền…"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
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
        </header>

        {/* CONTENT */}
        <section className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thanh toán QR</h1>
              <p className="text-slate-600">Quét mã để hoàn tất giao dịch an toàn, nhanh chóng.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-6">
            {/* Left */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
              <div className="qr-grad px-5 md:px-7 py-5 border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/90 ring-1 ring-slate-200">
                      <i data-feather="smartphone" className="w-5 h-5 text-blue-700" />
                    </span>
                    <div>
                      <div className="text-sm text-slate-600">Thanh toán cho</div>
                      <div className="font-bold">{companyName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Số tiền</div>
                    <div className="text-2xl font-extrabold">{fmtCurrency(amount)}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-7 grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-start">
                {/* QR card */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <i data-feather="clock" className="w-4 h-4" />
                      Hết hạn trong <span className="font-semibold text-slate-900 ml-1">{mmss(remain)}</span>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-1">
                      <i data-feather="shield" className="w-3.5 h-3.5" /> VIETQR / NAPAS 24/7
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden ring-1 ring-slate-200 p-3 bg-white">
                    <img
                      src={qrSrc}
                      alt="QR Code"
                      className="block w-full h-auto mx-auto"
                      decoding="sync"
                      loading="eager"
                      onError={(e) => (e.currentTarget.alt = "Không tải được ảnh qr.jpg")}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                    <button onClick={onDownloadQr} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
                      <i data-feather="download" className="w-4 h-4" />
                      Tải QR
                    </button>
                    <button onClick={() => copyText(qrPayload)} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
                      <i data-feather="copy" className="w-4 h-4" />
                      Copy nội dung
                    </button>
                    <button onClick={onRefresh} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
                      <i data-feather="refresh-cw" className="w-4 h-4" />
                      Làm mới
                    </button>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-3">
                    * Không chia sẻ mã QR cho người lạ. Mã sẽ tự vô hiệu khi hết thời gian.
                  </p>
                </div>

                {/* Status & instructions */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Trạng thái thanh toán</h3>
                      {status === "pending" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Đang chờ</span>
                      )}
                      {status === "success" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Thành công</span>
                      )}
                      {status === "expired" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">Hết hạn</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-700">
                      {status === "pending" && (
                        <>
                          <i data-feather="loader" className="w-4 h-4 animate-spin" />
                          Hệ thống đang chờ nhận tiền từ ngân hàng.
                        </>
                      )}
                      {status === "success" && (
                        <>
                          <i data-feather="check" className="w-4 h-4 text-emerald-600" />
                          Đã nhận tiền. Đang phát hành e-invoice…
                        </>
                      )}
                      {status === "expired" && (
                        <>
                          <i data-feather="x-circle" className="w-4 h-4 text-rose-600" />
                          Mã QR đã hết hạn, vui lòng bấm <b className="mx-1">Làm mới</b> để tạo lại.
                        </>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                        <div className="text-[11px] text-slate-500">Mã đơn</div>
                        <div className="font-mono font-semibold text-[12px] md:text-[13px] leading-6 tracking-normal overflow-x-auto no-scrollbar">
                          <span id="order-id" className="whitespace-nowrap">
                            {orderId}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                        <div className="text-[11px] text-slate-500">Thời gian</div>
                        <div className="font-semibold">{orderTime}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                        <div className="text-[11px] text-slate-500">Kênh</div>
                        <div className="font-semibold">MoMo / Banking</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold mb-2">Hướng dẫn nhanh</h3>
                    <ol className="list-decimal pl-5 text-sm space-y-1 text-slate-700">
                      <li>
                        Mở <span className="font-medium">MoMo</span> hoặc app ngân hàng (Vietcombank, Techcombank, v.v.).
                      </li>
                      <li>
                        Chọn <span className="font-medium">Quét QR</span> và đưa camera vào vùng mã.
                      </li>
                      <li>
                        Kiểm tra đúng <span className="font-medium">tên người nhận: {companyName}</span> và số tiền.
                      </li>
                      <li>Xác nhận và hoàn tất. Hệ thống sẽ tự động cập nhật trạng thái.</li>
                    </ol>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold mb-2">Phương thức</h3>
                    <div className="flex flex-wrap gap-2">
                      {["momo", "vietqr", "zalo"].map((m) => {
                        const label = m === "momo" ? "MoMo" : m === "vietqr" ? "VietQR" : "ZaloPay";
                        const active = activeMethod === m;
                        return (
                          <button
                            key={m}
                            onClick={() => setActiveMethod(m)}
                            className={[
                              "method-btn h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50",
                              active ? "ring-2 ring-blue-200 bg-blue-50" : "",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order details */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-5 md:p-7">
              <h2 className="text-xl font-bold">Thông tin đơn hàng</h2>
              <div className="card-line my-5" />
              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-500">Nhà cung cấp</div>
                    <div className="mt-1 font-medium">{companyName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Mã đơn hàng</div>
                    <div className="mt-1 font-mono font-semibold text-[13px] md:text-[14px] leading-5 tracking-normal overflow-x-auto no-scrollbar">
                      <span className="whitespace-nowrap">{orderId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Mô tả</div>
                  <p className="mt-1 font-medium">{orderDesc}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-500">Số tiền</div>
                    <div className="mt-1 text-2xl font-extrabold">{fmtCurrency(amount)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Phí giao dịch</div>
                    <div className="mt-1 font-medium">Miễn phí</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-slate-500">Ghi chú chuyển khoản</div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="px-2 py-1 rounded-lg bg-white border border-slate-200">{note}</code>
                    <button
                      onClick={() => copyText(note)}
                      className="h-8 px-2 rounded-lg border border-slate-200 hover:bg-white flex items-center gap-1 text-xs"
                    >
                      <i data-feather="copy" className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={onCancel} className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                    Huỷ thanh toán
                  </button>
                  <button onClick={onSupport} className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                    Liên hệ hỗ trợ
                  </button>
                </div>

                <p className="text-[12px] text-slate-500">* Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.</p>
              </div>
            </div>
          </div>

          {/* Success banner */}
          {successBar && (
            <div className="animate-in">
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-sm">
                  <i data-feather="check-circle" className="w-6 h-6" />
                  <span className="font-semibold">Giao dịch thành công</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="text-center text-slate-400 text-xs mt-4 mb-6">
          © 2025 Gemadept – Mẫu giao diện demo thanh toán QR.
        </footer>
      </main>

      {/* Tiny toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-in z-[60]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
