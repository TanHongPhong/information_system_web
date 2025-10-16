import { useEffect, useMemo } from "react";
import feather from "feather-icons";

export default function QRCard({
  payee,
  amountText,
  remainSeconds,
  qrSrc,
  onDownload,
  onCopy,
  onRefresh,
}) {
  useEffect(() => { feather.replace(); });

  const mmss = useMemo(() => {
    const m = String(Math.floor(remainSeconds / 60)).padStart(2, "0");
    const s = String(remainSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remainSeconds]);

  return (
    <>
      {/* Header */}
      <div className="qr-grad px-5 md:px-7 py-5 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/90 ring-1 ring-slate-200">
              <i data-feather="smartphone" className="w-5 h-5 text-blue-700" />
            </span>
            <div>
              <div className="text-sm text-slate-600">Thanh toán cho</div>
              <div className="font-bold">{payee}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Số tiền</div>
            <div className="text-2xl font-extrabold">{amountText}</div>
          </div>
        </div>
      </div>

      {/* QR + actions */}
      <div className="p-5 md:p-7 grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-start">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <i data-feather="clock" className="w-4 h-4" />
              Hết hạn trong <span className="font-semibold text-slate-900 ml-1">{mmss}</span>
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
              onError={(e) => (e.currentTarget.alt = "Không tải được ảnh QR")}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
            <button onClick={onDownload} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
              <i data-feather="download" className="w-4 h-4" />Tải QR
            </button>
            <button onClick={onCopy} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
              <i data-feather="copy" className="w-4 h-4" />Copy nội dung
            </button>
            <button onClick={onRefresh} className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
              <i data-feather="refresh-cw" className="w-4 h-4" />Làm mới
            </button>
          </div>

          <p className="text-[12px] text-slate-500 mt-3">
            * Không chia sẻ mã QR cho người lạ. Mã sẽ tự vô hiệu khi hết thời gian.
          </p>
        </div>

        {/* Cột phải (Status + Hướng dẫn) render ở App */}
      </div>
    </>
  );
}
