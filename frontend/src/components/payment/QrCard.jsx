import React from "react";

export default function QrCard({ qrCodeUrl, amount, orderId }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md">
      <div className="text-center">
        <h2 className="text-xl font-bold">Quét mã QR để thanh toán</h2>
        <p className="text-slate-500">Đơn hàng #{orderId}</p>
      </div>

      {qrCodeUrl && (
        <div className="flex justify-center">
          <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
        </div>
      )}

      <div className="text-center">
        <div className="text-sm text-slate-500">Số tiền cần thanh toán</div>
        <div className="text-2xl font-bold text-blue-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(amount)}
        </div>
      </div>
    </div>
  );
}
