import React from "react";

function Overlay() {
  return <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[2px]" />;
}

function DetailsSheet() {
  return (
    <aside className="fixed right-0 top-0 h-full w-full max-w-xl bg-white border-l border-slate-200 rounded-l-2xl overflow-y-auto shadow-2xl z-[70]">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="px-5 py-4 flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
              <path d="M15 19l-7-7 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-blue-600 underline">Trở lại</span>
          </button>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5">
        <div className="flex items-start md:items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">ORDERID 0112</div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Lương Quang Trè</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-white border border-slate-300">Từ chối</button>
            <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-blue-600 text-white">Chấp nhận</button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {[
              ["Tên hàng hóa:", "Hải sản đông lạnh"],
              ["Lộ trình:", "Vũng Tàu → Đà Nẵng"],
              ["Cân nặng đơn hàng:", "96kg"],
              ["Kích thước:", "100×40×60"],
              ["Loại xe:", "Xe container 20feet"],
              ["Mô tả sản phẩm:", "Hàng đông lạnh, dễ vỡ, tránh xóc, chèn ép"],
              ["Số điện thoại liên hệ", <a key="tel" className="text-blue-600" href="tel:0919345623">0919345623</a>],
            ].map(([label, value]) => (
              <div className="grid grid-cols-12" key={label}>
                <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium">{label}</div>
                <div className="col-span-7 md:col-span-8 px-4 py-3">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400">Thông tin được lấy từ yêu cầu đặt hàng của khách.</div>
        <div className="h-24" />
      </div>
    </aside>
  );
}

DetailsSheet.Overlay = Overlay;
export default DetailsSheet;
