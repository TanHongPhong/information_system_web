import { useEffect } from "react";
import feather from "feather-icons";

export default function OrderCard({
  supplier,
  orderCode,
  desc,
  amountText,
  feeText,
  noteText,
  onCopyNote,
  onCancel,
  onSupport,
}) {
  useEffect(() => { feather.replace(); }, [orderCode, amountText]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-5 md:p-7">
      <h2 className="text-xl font-bold">Thông tin đơn hàng</h2>
      <div className="card-line my-5"></div>
      <div className="space-y-5 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-500">Nhà cung cấp</div>
            <div className="mt-1 font-medium">{supplier}</div>
          </div>
          <div>
            <div className="text-slate-500">Mã đơn hàng</div>
            <div className="mt-1 font-mono font-semibold text-[13px] md:text-[14px] leading-5 tracking-normal overflow-x-auto no-scrollbar">
              <span className="whitespace-nowrap">{orderCode}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-slate-500">Mô tả</div>
          <p className="mt-1 font-medium">{desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-500">Số tiền</div>
            <div className="mt-1 text-2xl font-extrabold">{amountText}</div>
          </div>
          <div>
            <div className="text-slate-500">Phí giao dịch</div>
            <div className="mt-1 font-medium">{feeText}</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-slate-500">Ghi chú chuyển khoản</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="px-2 py-1 rounded-lg bg-white border border-slate-200">{noteText}</code>
            <button onClick={onCopyNote} className="h-8 px-2 rounded-lg border border-slate-200 hover:bg-white flex items-center gap-1 text-xs">
              <i data-feather="copy" className="w-3.5 h-3.5" />Copy
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">Huỷ thanh toán</button>
          <button onClick={onSupport} className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Liên hệ hỗ trợ</button>
        </div>

        <p className="text-[12px] text-slate-500">* Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.</p>
      </div>
    </div>
  );
}
