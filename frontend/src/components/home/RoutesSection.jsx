import React from "react";

const ROUTES = [
  { tag:"Liên tỉnh", dist:"≈ 35–50km", title:"TP.HCM ↔ Đồng Nai (Biên Hòa/Long Thành)", note:"Cao tốc HCM–LT–DG, QL51 • 500kg → 2.5t", price:"~105.000đ / 4km" },
  { tag:"Nội vùng", dist:"≈ 15–30km", title:"HCM ↔ Bình Dương (Thuận An/Dĩ An)", note:"QL13, DT743 • khung giờ linh hoạt", price:"~120.000đ / 4km" },
  { tag:"Liên vùng", dist:"≈ 80–100km", title:"HCM ↔ Bà Rịa – Vũng Tàu", note:"QL51 • hỗ trợ giao gấp", price:"~340.000đ / 40km" },
];

export default function RoutesSection() {
  return (
    <section id="routes" className="py-12 lg:py-16 bg-gradient-to-b from-white to-blue-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Tuyến phổ biến</h2>
          <a href="#" className="text-sm text-blue-600 underline">Xem tất cả</a>
        </div>
        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ROUTES.map((r)=>(
            <div key={r.title} className="rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-[0_10px_24px_rgba(37,99,235,.32)] transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">{r.tag}</span>
                <span className="text-xs text-slate-500">{r.dist}</span>
              </div>
              <div className="mt-3 text-lg font-semibold">{r.title}</div>
              <p className="mt-1 text-sm subtitle-soft">{r.note}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm subtitle-soft">Từ <span className="font-semibold text-slate-900">{r.price}</span></div>
                <button className="px-3 py-1.5 rounded-lg text-white text-sm font-medium btn-shine bg-blue-600 hover:bg-blue-700">Đặt nhanh</button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Giá mang tính minh hoạ UI; hệ thống sẽ báo giá chính xác theo km & tải trọng.</p>
      </div>
    </section>
  );
}
