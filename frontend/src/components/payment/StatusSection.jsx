import React from "react";

export default function StatusSection({
  status,               // 'pending' | 'success' | 'expired'
  orderId,
  orderTime,            // string
  companyName,
  activeMethod,         // 'momo' | 'vietqr' | 'zalo' | null
  setActiveMethod,
}) {
  return (
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
          {status === "pending" && (<><i data-feather="loader" className="w-4 h-4 animate-spin" />Hệ thống đang chờ nhận tiền từ ngân hàng.</>)}
          {status === "success" && (<><i data-feather="check" className="w-4 h-4 text-emerald-600" />Đã nhận tiền. Đang phát hành e-invoice…</>)}
          {status === "expired" && (<><i data-feather="x-circle" className="w-4 h-4 text-rose-600" />Mã QR đã hết hạn, vui lòng bấm <b className="mx-1">Làm mới</b> để tạo lại.</>)}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
            <div className="text-[11px] text-slate-500">Mã đơn</div>
            <div className="font-mono font-semibold text-[12px] md:text-[13px] leading-6 tracking-normal overflow-x-auto no-scrollbar">
              <span id="order-id" className="whitespace-nowrap">{orderId}</span>
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
          <li>Mở <span className="font-medium">MoMo</span> hoặc app ngân hàng (Vietcombank, Techcombank, v.v.).</li>
          <li>Chọn <span className="font-medium">Quét QR</span> và đưa camera vào vùng mã.</li>
          <li>Kiểm tra đúng <span className="font-medium">tên người nhận: {companyName}</span> và số tiền.</li>
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
  );
}
