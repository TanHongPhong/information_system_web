import React from "react";

export default function OrderDetailSheet() {
  return (
    <>
      {/* overlay mờ */}
      <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[2px]" />

      {/* side sheet */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-xl bg-white border-l border-slate-200 rounded-l-2xl overflow-y-auto shadow-2xl z-[70]">
        {/* header sticky */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="px-5 py-4 flex items-center gap-3">
            <button className="inline-flex items-center gap-2 text-slate-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-current"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium text-blue-600">
                Trở lại
              </span>
            </button>
          </div>
        </div>

        {/* nội dung */}
        <div className="px-5 md:px-6 py-5">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">
                ORDERID 0112
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Lương Quang Trè
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">
                Từ chối
              </button>
              <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Chấp nhận
              </button>
            </div>
          </div>

          {/* thông tin chi tiết */}
          <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              <InfoRow
                left="Tên hàng hóa:"
                right="Hải sản đông lạnh"
              />
              <InfoRow
                left="Lộ trình:"
                right="Vũng Tàu → Đà Nẵng"
              />
              <InfoRow
                left="Cân nặng đơn hàng:"
                right="96kg"
              />
              <InfoRow
                left="Kích thước:"
                right="100×40×60"
              />
              <InfoRow
                left="Loại xe:"
                right="Xe container 20feet"
              />
              <InfoRow
                left="Mô tả sản phẩm:"
                right="Hàng đông lạnh, dễ vỡ, tránh xóc, chèn ép"
              />
              <InfoRow
                left="Số điện thoại liên hệ"
                right={
                  <a className="text-blue-600">
                    0919345623
                  </a>
                }
              />
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Thông tin được lấy từ yêu cầu đặt hàng của khách.
          </div>

          <div className="h-24" />
        </div>
      </aside>
    </>
  );
}

function InfoRow({ left, right }) {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-5 md:col-span-4 px-4 py-3 bg-slate-50 text-slate-600 font-medium text-sm">
        {left}
      </div>
      <div className="col-span-7 md:col-span-8 px-4 py-3 text-sm text-slate-800">
        {right}
      </div>
    </div>
  );
}
