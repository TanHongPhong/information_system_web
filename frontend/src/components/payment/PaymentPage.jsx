// components/PaymentPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Smartphone, Shield, Clock, Download, Copy, RefreshCw, Loader, Check, XCircle } from "lucide-react";
import OrderDetails from "./OrderDetails";
import MethodsPicker from "./MethodsPicker";

const VND = (n) => n.toLocaleString("vi-VN");

export default function PaymentPage() {
  // demo data
  const provider = "Công ty Gemadept";
  const amount = 10_000_000;
  const orderCode = "322138483848";
  const note = `GMD-${orderCode}`;
  const [status, setStatus] = useState("pending"); // 'pending' | 'success' | 'expired'
  const [orderTime, setOrderTime] = useState("—");
  const [method, setMethod] = useState("momo");
  const [remain, setRemain] = useState(15 * 60); // seconds
  const seedRef = useRef(0);

  // countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setRemain((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setStatus("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [seedRef.current]); // restart khi seedRef thay đổi

  // fake success sau 9s (demo)
  useEffect(() => {
    if (status !== "pending") return;
    const t = setTimeout(() => {
      setStatus("success");
      setOrderTime(new Date().toLocaleString("vi-VN"));
    }, 9000);
    return () => clearTimeout(t);
  }, [status]);

  const mmss = useMemo(() => {
    const m = String(Math.floor(remain / 60)).padStart(2, "0");
    const s = String(remain % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remain]);

  const toast = (msg) => {
    const el = document.createElement("div");
    el.className =
      "fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-[60]";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy vào clipboard");
    } catch {
      alert("Không copy được.");
    }
  };

  const refresh = () => {
    setStatus("pending");
    setRemain(15 * 60);
    seedRef.current += 1; // để effect countdown chạy lại
  };

  return (
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
          {/* header strip */}
          <div className="px-5 md:px-7 py-5 border-b border-slate-200"
               style={{background: "linear-gradient(150deg,#7dd3fc 0%, #e0e7ff 40%, #ffffff 100%)"}}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/90 ring-1 ring-slate-200">
                  <Smartphone className="w-5 h-5 text-blue-700" />
                </span>
                <div>
                  <div className="text-sm text-slate-600">Thanh toán cho</div>
                  <div className="font-bold">{provider}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Số tiền</div>
                <div className="text-2xl font-extrabold">{VND(amount)} VNĐ</div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7 grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-start">
            {/* QR card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  Hết hạn trong <span className="font-semibold text-slate-900 ml-1">{mmss}</span>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> VIETQR / NAPAS 24/7
                </div>
              </div>

              <div className="rounded-xl overflow-hidden ring-1 ring-slate-200 p-3 bg-white">
                {/* thay đường dẫn QR của bạn tại đây */}
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.rkE9lfhXa6ijYsu_ObWtdwHaNB?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="QR Code"
                  className="block w-full h-auto mx-auto"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = "qr.jpg";
                    a.download = "gemadept-vietqr.jpg";
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />Tải QR
                </button>

                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={() => handleCopy(`VIETQR|GEMADEPT|${amount}|GMD-${orderCode}`)}
                >
                  <Copy className="w-4 h-4" />Copy nội dung
                </button>

                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={refresh}
                >
                  <RefreshCw className="w-4 h-4" />Làm mới
                </button>
              </div>
              <p className="text-[12px] text-slate-500 mt-3">
                * Không chia sẻ mã QR cho người lạ. Mã sẽ tự vô hiệu khi hết thời gian.
              </p>
            </div>

            {/* Status + instructions + methods */}
            <div className="space-y-4">
              {/* Status */}
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
                  {status === "pending" && (<Loader className="w-4 h-4 animate-spin" />)}
                  {status === "success" && (<Check className="w-4 h-4 text-emerald-600" />)}
                  {status === "expired" && (<XCircle className="w-4 h-4 text-rose-600" />)}
                  <div>
                    {status === "pending" && "Hệ thống đang chờ nhận tiền từ ngân hàng."}
                    {status === "success" && "Đã nhận tiền. Đang phát hành e-invoice…"}
                    {status === "expired" && <>Mã QR đã hết hạn, hãy bấm <b>Làm mới</b> để tạo lại.</>}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                    <div className="text-[11px] text-slate-500">Mã đơn</div>
                    <div
                      className="font-mono font-semibold text-[12px] md:text-[13px] leading-6 overflow-x-auto whitespace-nowrap"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {orderCode}
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

              {/* Instructions */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold mb-2">Hướng dẫn nhanh</h3>
                <ol className="list-decimal pl-5 text-sm space-y-1 text-slate-700">
                  <li>Mở <span className="font-medium">MoMo</span> hoặc app ngân hàng (Vietcombank, Techcombank, v.v.).</li>
                  <li>Chọn <span className="font-medium">Quét QR</span> và đưa camera vào vùng mã.</li>
                  <li>Kiểm tra đúng <span className="font-medium">tên người nhận: {provider}</span> và số tiền.</li>
                  <li>Xác nhận và hoàn tất. Hệ thống sẽ tự động cập nhật trạng thái.</li>
                </ol>
              </div>

              {/* Methods */}
              <MethodsPicker value={method} onChange={setMethod} />
            </div>
          </div>
        </div>

        {/* Right */}
        <OrderDetails
          provider={provider}
          amount={amount}
          orderCode={orderCode}
          note={`GMD-${orderCode}`}
          onCopy={(t) => navigator.clipboard.writeText(t)}
        />
      </div>

      {/* Success banner */}
      {status === "success" && (
        <div className="animate-in">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-sm">
              <Check className="w-6 h-6" />
              <span className="font-semibold">Giao dịch thành công</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
