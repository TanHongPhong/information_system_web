import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import QrCard from "../components/payment/QrCard";
import StatusSection from "../components/payment/StatusSection";
import OrderDetails from "../components/payment/OrderDetails";

export default function QrPayment({
  amount = 10_000_000,
  companyName = "Công ty Gemadept",
  orderId = "322138483848",
  orderDesc = "Xe container 4000kg, lộ trình TP.HCM → Hà Nội, ngày lấy hàng: 17/10/2025",
  qrSrc = "/qr.jpg",
}) {
  // ==== STATE ====
  const [remain, setRemain] = useState(15 * 60);
  const [status, setStatus] = useState("pending"); // 'pending' | 'success' | 'expired'
  const [successBar, setSuccessBar] = useState(false);
  const [orderTime, setOrderTime] = useState("—");
  const [activeMethod, setActiveMethod] = useState(null); // 'momo' | 'vietqr' | 'zalo'
  const [toastMsg, setToastMsg] = useState("");

  // ==== HELPERS ====
  const fmtCurrency = (v) => Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
  const mmss = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ==== EFFECTS ====
  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  // Countdown
  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => {
      setRemain((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Hết giờ
            useEffect(() => { if (remain === 0 && status === "pending") setStatus("expired"); }, [remain, status]);

  // Toast auto-hide
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(""), 1600); return () => clearTimeout(t); }, [toastMsg]);

  // ==== ACTIONS ====
  const onDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrSrc; a.download = "gemadept-vietqr.jpg"; a.click();
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); setToastMsg("Đã copy vào clipboard"); }
    catch { setToastMsg("Không copy được."); }
  };
  const onRefresh = () => { setRemain(15 * 60); setStatus("pending"); setSuccessBar(false); };
  const onCancel = () => setToastMsg("Bạn đã huỷ thanh toán (demo).");
  const onSupport = () => setToastMsg("Đã mở kênh hỗ trợ (demo).");

  // ==== DERIVED ====
  const note = `GMD-${orderId}`;
  const qrPayload = `VIETQR|GEMADEPT|${amount}|${note}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Local styles (giữ như bản gốc) */}
      <style>{`
        html, body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        :is(button,a,select,input,details,summary):focus-visible{outline:2px solid #2563eb;outline-offset:2px}
        .qr-grad{background:linear-gradient(150deg,#7dd3fc 0%, #e0e7ff 40%, #ffffff 100%)}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        #order-id{font-variant-numeric:tabular-nums;display:inline-block;line-height:1.45}
      `}</style>

      {/* SIDEBAR (giữ nguyên) */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ"><i data-feather="home" /></a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><i data-feather="map" /></a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch"><i data-feather="file-text" /></a>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><i data-feather="user" /></a>
          <a href="#" className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><i data-feather="settings" /></a>
        </div>
      </aside>

      <main className="ml-20">
        {/* HEADER (giữ nguyên) */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Tìm giao dịch, mã đơn, số tiền…" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
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
            {/* LEFT box */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
              {/* Gradient header */}
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
                {/* QR CARD (component) */}
                <QrCard
                  remainText={mmss(remain)}
                  qrSrc={qrSrc}
                  onDownload={onDownloadQr}
                  onCopyPayload={() => copyText(qrPayload)}
                  onRefresh={onRefresh}
                />

                {/* STATUS + HDSD + METHODS (component) */}
                <StatusSection
                  status={status}
                  orderId={orderId}
                  orderTime={orderTime}
                  companyName={companyName}
                  activeMethod={activeMethod}
                  setActiveMethod={setActiveMethod}
                />
              </div>
            </div>

            {/* RIGHT: ORDER DETAILS (component) */}
            <OrderDetails
              companyName={companyName}
              orderId={orderId}
              orderDesc={orderDesc}
              amount={amount}
              fmtCurrency={fmtCurrency}
              note={`GMD-${orderId}`}
              onCopyNote={() => copyText(`GMD-${orderId}`)}
              onCancel={onCancel}
              onSupport={onSupport}
            />
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
