import { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import QRCard from "../components/payment/QrCard.jsx";
import StatusCard from "../components/payment/StatusCard.jsx";
import OrderCard from "../components/payment/OrderCard.jsx";

export default function App() {
  // ===== Mock data =====
  const payee = "Công ty Gemadept";
  const supplier = "Công ty Gemadept";
  const amount = 10_000_000;
  const orderId = "322138483848";
  const orderDesc =
    "Xe container 4000kg, lộ trình TP.HCM → Hà Nội, ngày lấy hàng: 17/10/2025";
  const channel = "MoMo / Banking";
  const noteText = `GMD-${orderId}`;

  // ===== State =====
  const [status, setStatus] = useState("pending"); // pending | success | expired
  const [orderTime, setOrderTime] = useState("—");
  const [remain, setRemain] = useState(15 * 60); // mm:ss

  // Icons cho header/sidebar
  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);

  // Đếm ngược
  useEffect(() => {
    const iv = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          clearInterval(iv);
          setStatus((s) => (s === "success" ? s : "expired"));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Fake auto-success sau 9s nếu chưa hết hạn
  useEffect(() => {
    if (status !== "pending") return;
    const t = setTimeout(() => {
      setStatus((s) => (remain > 0 && s === "pending" ? "success" : s));
      setOrderTime(new Date().toLocaleString("vi-VN"));
    }, 9000);
    return () => clearTimeout(t);
  }, [status, remain]);

  const fmtVND = (n) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

  const qrPayload = useMemo(
    () => `VIETQR|GEMADEPT|${amount}|${noteText}`,
    [amount, noteText]
  );

  // Actions
  const onRefresh = () => {
    setStatus("pending");
    setRemain(15 * 60);
  };

  const onDownloadQR = () => {
    const a = document.createElement("a");
    a.href = "qr.jpg";
    a.download = "gemadept-vietqr.jpg";
    a.click();
  };

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Đã copy vào clipboard"); }
    catch { alert("Không copy được."); }
  }

  function toast(msg) {
    const el = document.createElement("div");
    el.className = "fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-in z-[60]";
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <style>{`
        html, body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        :is(button, a, select, input, details, summary):focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
        .card-line { height:1px; background: linear-gradient(90deg,#e8e8e8,#f6f6f6 60%,#ffffff); }
        .qr-grad { background: linear-gradient(150deg,#7dd3fc 0%, #e0e7ff 40%, #ffffff 100%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        #order-id { font-variant-numeric: tabular-nums; display: inline-block; line-height: 1.45; }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Trang chủ"><i data-feather="home" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><i data-feather="map" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch"><i data-feather="file-text" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><i data-feather="user" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><i data-feather="settings" /></button>
        </div>
      </aside>

      <main className="ml-20">
        {/* Header */}
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

        {/* ===== CONTENT ===== */}
        <section className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thanh toán QR</h1>
            <p className="text-slate-600">Quét mã để hoàn tất giao dịch an toàn, nhanh chóng.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-6">
            {/* Left: QR + Status + Hướng dẫn */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
              <QRCard
                payee={payee}
                amountText={fmtVND(amount)}
                remainSeconds={remain}
                qrSrc="qr.jpg"
                onDownload={onDownloadQR}
                onCopy={() => copy(qrPayload)}
                onRefresh={onRefresh}
              />

              <div className="p-5 md:p-7 space-y-4">
                <StatusCard status={status} orderId={orderId} orderTime={orderTime} channel={channel} />

                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold mb-2">Hướng dẫn nhanh</h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1 text-slate-700">
                    <li>Mở <span className="font-medium">MoMo</span> hoặc app ngân hàng (Vietcombank, Techcombank, v.v.).</li>
                    <li>Chọn <span className="font-medium">Quét QR</span> và đưa camera vào vùng mã.</li>
                    <li>Kiểm tra đúng <span className="font-medium">tên người nhận: {payee}</span> và số tiền.</li>
                    <li>Xác nhận và hoàn tất. Hệ thống sẽ tự động cập nhật trạng thái.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Right: Order */}
            <OrderCard
              supplier={supplier}
              orderCode={orderId}
              desc={orderDesc}
              amountText={fmtVND(amount)}
              feeText="Miễn phí"
              noteText={noteText}
              onCopyNote={() => copy(noteText)}
              onCancel={() => alert("Đã huỷ thanh toán (demo).")}
              onSupport={() => alert("Liên hệ hỗ trợ (demo).")}
            />
          </div>

          {/* Success bar (inline) */}
          {status === "success" && (
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
    </div>
  );
}
