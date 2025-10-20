export default function OrderList() {
  return (
    <div className="sticky top-[calc(var(--topbar-h,64px)-55px)]">
      <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
          <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold tracking-tight">ĐƠN HÀNG CỦA BẠN</h3>
              <span className="text-xs text-slate-500">1 đơn đang theo dõi</span>
            </div>
          </div>

          <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
                  <i data-feather="package" className="w-4 h-4" />
                </span>
                <div className="text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">ORDERID 0112</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-blue-700 ring-1 ring-blue-300">
                      ĐANG VẬN CHUYỂN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    279 Nguyễn Tri Phương, Q10 → 777 Lê Lai, Hà Nội
                  </div>
                  <div className="mt-2 mini-progress"><span style={{ transform: "scaleX(.62)" }} /></div>
                </div>
              </div>
              <button
                title="Theo dõi"
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-blue-600 text-white ring-1 ring-blue-500/30 hover:brightness-105"
              >
                <i data-feather="map-pin" className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-slate-600">
              <div className="flex items-center gap-1">
                <i data-feather="clock" className="w-4 h-4" /> Dự kiến: 20/10/2025 16:30
              </div>
              <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href="#">
                <i data-feather="download" className="w-4 h-4" />Hóa đơn
              </a>
            </div>
          </article>

          <div className="mt-4 p-3 rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-sky-50 to-white">
            <div className="text-sm font-semibold text-slate-800">Mẹo giao nhận an toàn</div>
            <ul className="mt-1 text-[12px] text-slate-600 list-disc pl-5 space-y-1">
              <li>Luôn xác minh mã đơn/OTP khi nhận.</li>
              <li>Ưu tiên thanh toán không tiền mặt.</li>
              <li>Kiểm tra niêm phong trước khi ký.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
