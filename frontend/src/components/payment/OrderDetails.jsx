// components/OrderDetails.jsx
import React from "react";
import { Copy } from "lucide-react";

const currency = (n) => n.toLocaleString("vi-VN");

export default function OrderDetails({ provider, orderCode, amount, note, orderDescription, vehicleType, pickupAddress, dropoffAddress, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-5 md:p-7">
      <h2 className="text-xl font-bold">Thông tin đơn hàng</h2>
      <div className="my-5 h-px" style={{ background: "linear-gradient(90deg,#e8e8e8,#f6f6f6 60%,#ffffff)" }} />
      <div className="space-y-5 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-500">Nhà cung cấp</div>
            <div className="mt-1 font-medium">{provider}</div>
          </div>
          <div>
            <div className="text-slate-500">Mã đơn hàng</div>
            <div className="mt-1 font-mono font-semibold text-[13px] md:text-[14px] leading-5 overflow-x-auto whitespace-nowrap">
              {orderCode}
            </div>
          </div>
        </div>

        <div>
          <div className="text-slate-500">Mô tả</div>
          <p className="mt-1 font-medium">{orderDescription || "—"}</p>
        </div>

        {vehicleType && (
          <div>
            <div className="text-slate-500">Loại xe</div>
            <div className="mt-1 font-medium">{vehicleType}</div>
          </div>
        )}

        {pickupAddress && (
          <div>
            <div className="text-slate-500">Điểm lấy hàng</div>
            <div className="mt-1 font-medium">{pickupAddress}</div>
          </div>
        )}

        {dropoffAddress && (
          <div>
            <div className="text-slate-500">Điểm giao hàng</div>
            <div className="mt-1 font-medium">{dropoffAddress}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-500">Số tiền</div>
            <div className="mt-1 text-2xl font-extrabold">{currency(amount)} VNĐ</div>
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
              className="h-8 px-2 rounded-lg border border-slate-200 hover:bg-white flex items-center gap-1 text-xs"
              onClick={() => onCopy?.(note)}
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />Copy
            </button>
          </div>
        </div>

        <p className="text-[12px] text-slate-500">
          * Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.
        </p>
      </div>
    </div>
  );
}
