import React from "react";

/**
 * Cột phải "Order Requests"
 * - KHÔNG còn minimap
 */
export default function OrderRequests() {
  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all h-[calc(100vh-180px)] flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="font-semibold text-lg text-slate-800 flex-shrink-0">
          Order Requests
        </h3>

        <div className="relative flex-1 max-w-xs">
          <i
            data-feather="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          ></i>
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm kiếm đơn hàng"
          />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">
        Yêu cầu đặt hàng gần đây
      </div>

      {/* Danh sách scroll */}
      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
        {/* Card 1 (highlight NEW) */}
        <OrderCard
          highlight
          id="ORDERID 0112"
          time="20/10/2025 9:00"
          from="279 Nguyễn Tri Phương P8 Q10 TPHCM"
          to="777 Lê Lai P3 Q1 TP.Hà Nội"
          init="QT"
          name="Quang Trè"
          avatarBg="bg-indigo-100"
          avatarText="text-indigo-700"
        />

        {/* Card 2 */}
        <OrderCard
          id="ORDERID 0255"
          time="22/10/2025 14:00"
          from="436 Trường Sa P3 Q7 TPHCM"
          to="555 Phan Đăng Lưu P7 Q.Phú Nhuận"
          init="VA"
          name="Văn An"
          avatarBg="bg-green-100"
          avatarText="text-green-700"
        />

        {/* Card 3 */}
        <OrderCard
          id="ORDERID 8813"
          time="28/10/2025 11:30"
          from="KCN Amata, Biên Hòa, Đồng Nai"
          to="KCN Sóng Thần, Dĩ An, Bình Dương"
          init="TB"
          name="Trần Bích"
          avatarBg="bg-red-100"
          avatarText="text-red-700"
        />

        {/* Card 4 */}
        <OrderCard
          id="ORDERID 9021"
          time="01/11/2025 08:00"
          from="123 Lê Lợi, P. Bến Thành, Q.1, TPHCM"
          to="456 Hai Bà Trưng, P. Tân Định, Q.1"
          init="HP"
          name="Hữu Phước"
          avatarBg="bg-purple-100"
          avatarText="text-purple-700"
        />

        {/* Card 5 */}
        <OrderCard
          id="ORDERID 9134"
          time="05/11/2025 10:00"
          from="789 Nguyễn Văn Cừ, P.4, Q.5, TPHCM"
          to="321 Trần Hưng Đạo, P. Cầu Ông Lãnh, Q.1"
          init="GH"
          name="Gia Hân"
          avatarBg="bg-blue-100"
          avatarText="text-blue-700"
        />

        {/* Card 6 */}
        <OrderCard
          id="ORDERID 9278"
          time="10/11/2025 15:30"
          from="456 Lý Thường Kiệt, P.7, Q. Tân Bình, TPHCM"
          to="123 Nguyễn Huệ, P. Bến Nghé, Q.1"
          init="AT"
          name="Anh Tuấn"
          avatarBg="bg-orange-100"
          avatarText="text-orange-700"
        />

        {/* Card 7 */}
        <OrderCard
          id="ORDERID 9356"
          time="15/11/2025 09:45"
          from="321 Phạm Văn Đồng, P.3, Q. Gò Vấp, TPHCM"
          to="654 Lê Văn Sỹ, P.11, Q.3"
          init="BC"
          name="Bảo Châu"
          avatarBg="bg-teal-100"
          avatarText="text-teal-700"
        />
      </div>

      {/* Footer */}
      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          Map tiles ©{" "}
          <a
            className="underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all">
            Từ chối tất cả
          </button>
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---- Subcomponent: 1 card trong list ---- */
function OrderCard({
  highlight = false,
  id,
  time,
  from,
  to,
  init,
  name,
  avatarBg,
  avatarText,
}) {
  return (
    <article
      className={
        highlight
          ? "relative rounded-xl p-4 border-2 border-amber-300 bg-amber-50/70 overflow-hidden transition-all"
          : "rounded-xl p-4 border border-slate-200 bg-white hover:border-blue-300 transition-all"
      }
    >
      {highlight && (
        <div className="absolute top-0 right-0 text-[10px] font-bold text-amber-800 bg-amber-300 px-2 py-[2px] rounded-bl-lg leading-tight">
          NEW
        </div>
      )}

      {/* Hàng trên: mã + thời gian */}
      <div className="flex items-start justify-between text-xs text-slate-500 leading-relaxed">
        <div className="font-semibold text-slate-700">{id}</div>
        <div className="ml-4 flex-shrink-0">{time}</div>
      </div>

      {/* Thông tin tuyến đường (đã bỏ map => full width) */}
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Từ</div>
          <div className="font-medium text-slate-700 whitespace-pre-line">
            {from}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Đến</div>
          <div className="font-medium text-slate-700 whitespace-pre-line">
            {to}
          </div>
        </div>
      </div>

      {/* Footer: avatar + nút */}
      <div
        className={
          highlight
            ? "mt-3 pt-3 border-t border-amber-200 flex items-center justify-between"
            : "mt-3 pt-3 border-t border-slate-100 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center font-semibold text-xs ${avatarBg} ${avatarText}`}
          >
            {init}
          </div>
          <div className="font-medium text-sm text-slate-800">{name}</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}
