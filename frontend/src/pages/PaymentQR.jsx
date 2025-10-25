import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

import QrCard from "../components/payment/QrCard";
import StatusSection from "../components/payment/StatusSection";
import OrderDetails from "../components/payment/OrderDetails";
import { buildSepayQrUrl } from "../lib/sepay";
import Sidebar from "../components/Sidebar";
import Topbar from "@/components/Topbar";

export default function PaymentQR({
  amount = 10_000_000,
  companyName = "Công ty Gemadept",
  orderId = "322138483848",
  orderDesc = "Xe container 4000kg, lộ trình TP.HCM → Hà Nội, ngày lấy hàng: 17/10/2025",
}) {
  const nav = useNavigate();

  const [remain, setRemain] = useState(15 * 60);
  const [status, setStatus] = useState("pending");
  const [successBar, setSuccessBar] = useState(false);
  const [orderTime, setOrderTime] = useState("—");
  const [activeMethod, setActiveMethod] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const fmtCurrency = (v) =>
    Number(v).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });

  const mmss = (secs) => {
    const sInt = Math.max(0, Math.floor(secs));
    const m = String(Math.floor(sInt / 60)).padStart(2, "0");
    const s = String(sInt % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, []);

  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => setRemain((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (remain === 0 && status === "pending") setStatus("expired");
  }, [remain, status]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 1600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const note = useMemo(() => `GMD-${orderId}`, [orderId]);
  const qrPayload = useMemo(
    () => `VIETQR|GEMADEPT|${amount}|${note}`,
    [amount, note]
  );

  const qrSrc = useMemo(() => {
    const ACC = import.meta.env.VITE_SEPAY_ACC;
    const BANK = import.meta.env.VITE_SEPAY_BANK;
    const TEMPLATE = import.meta.env.VITE_SEPAY_TEMPLATE || "qronly";
    if (!ACC || !BANK) return "/qr.jpg";
    return buildSepayQrUrl({
      acc: ACC,
      bank: BANK,
      amount,
      des: note,
      template: TEMPLATE,
    });
  }, [amount, note]);

  const onDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `vietqr-${orderId}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    setToastMsg("Đã làm mới mã QR.");
  };

  const onCancel = () => nav("/nhap-in4");
  const onSupport = () => setToastMsg("Đã mở kênh hỗ trợ (demo).");

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <main className="ml-20">
        <Topbar />

        <section className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Thanh toán QR
              </h1>
              <p className="text-slate-600">
                Quét mã để hoàn tất giao dịch an toàn, nhanh chóng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
              <div className="qr-grad px-5 md:px-7 py-5 border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/90 ring-1 ring-slate-200">
                      <i
                        data-feather="smartphone"
                        className="w-5 h-5 text-blue-700"
                      />
                    </span>
                    <div>
                      <div className="text-sm text-slate-600">
                        Thanh toán cho
                      </div>
                      <div className="font-bold">{companyName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Số tiền</div>
                    <div className="text-2xl font-extrabold">
                      {fmtCurrency(amount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-7 grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-start">
                <QrCard
                  remainText={mmss(remain)}
                  qrSrc={qrSrc}
                  onDownload={onDownloadQr}
                  onCopyPayload={() => copyText(qrPayload)}
                  onRefresh={onRefresh}
                />
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

            <OrderDetails
              companyName={companyName}
              orderId={orderId}
              orderDesc={orderDesc}
              amount={amount}
              fmtCurrency={fmtCurrency}
              note={note}
              onCopyNote={() => copyText(note)}
              onCancel={onCancel}
              onSupport={onSupport}
            />
          </div>

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
    </div>
  );
}
