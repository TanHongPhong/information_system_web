import { useEffect, useMemo } from "react";
import feather from "feather-icons";

export default function StatusCard({ status, orderId, orderTime, channel }) {
  useEffect(() => { feather.replace(); }, [status, orderTime]);

  const pill = useMemo(() => {
    if (status === "success") return { text: "Thành công", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (status === "expired") return { text: "Hết hạn",   cls: "bg-rose-50 text-rose-700 ring-rose-200" };
    return { text: "Đang chờ", cls: "bg-amber-50 text-amber-700 ring-amber-200" };
  }, [status]);

  const content = useMemo(() => {
    if (status === "success") return (<><i data-feather="check" className="w-4 h-4 text-emerald-600" />Đã nhận tiền. Đang phát hành e-invoice…</>);
    if (status === "expired") return (<><i data-feather="x-circle" className="w-4 h-4 text-rose-600" />Mã QR đã hết hạn, bấm <b className="mx-1">Làm mới</b> để tạo lại.</>);
    return (<><i data-feather="loader" className="w-4 h-4 animate-spin" />Hệ thống đang chờ nhận tiền từ ngân hàng.</>);
  }, [status]);

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Trạng thái thanh toán</h3>
        <span className={`text-xs px-2 py-1 rounded-full ring-1 ${pill.cls}`}>{pill.text}</span>
      </div>

      <div className="flex items-center gap-3 text-slate-700">{content}</div>

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
          <div className="font-semibold">{channel}</div>
        </div>
      </div>
    </div>
  );
}
