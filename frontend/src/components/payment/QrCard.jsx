import React from "react";

export default function QrCard({
  remainText,
  qrSrc,
  onDownload,
  onCopyPayload,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <i data-feather="clock" className="w-4 h-4" />
          Hết hạn trong{" "}
          <span className="font-semibold text-slate-900 ml-1">
            {remainText}
          </span>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-1">
          <i data-feather="shield" className="w-3.5 h-3.5" /> VIETQR / NAPAS
          24/7
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
        <button
          onClick={onDownload}
          className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <i data-feather="download" className="w-4 h-4" />
          Tải QR
        </button>
        <button
          onClick={onCopyPayload}
          className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <i data-feather="copy" className="w-4 h-4" />
          Copy nội dung
        </button>
        <button
          onClick={onRefresh}
          className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <i data-feather="refresh-cw" className="w-4 h-4" />
          Làm mới
        </button>
      </div>
      <p className="text-[12px] text-slate-500 mt-3">
        * Không chia sẻ mã QR cho người lạ. Mã sẽ tự vô hiệu khi hết thời gian.
      </p>
    </div>
  );
}
