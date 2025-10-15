import React from "react";
import { Zap, Search } from "lucide-react";

export default function HeroBooking() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[560px] h-[560px] bg-gradient-to-br from-blue-100 to-blue-50 rounded-blob" />
        <div className="absolute -bottom-24 -right-24 w-[620px] h-[620px] bg-gradient-to-br from-blue-100 to-white rounded-blob [animation-delay:2s]" />
        <div className="absolute inset-0 bg-dots opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-[fadeIn_.32s_ease-out_both]">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4" /> Nhanh — Minh bạch — Đúng giờ
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight title-grad leading-tight">
              Đặt xe chở hàng nhanh — minh bạch & đúng giờ
            </h1>
            <p className="mt-4 subtitle-soft text-base leading-relaxed">
              Kết nối đội xe 500kg – 2.5 tấn. Giá theo km & tải trọng rõ ràng, theo dõi realtime, hỗ trợ nội thành & liên tỉnh.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
              {[
                { v: "1.2k+", t: "Tài xế đối tác" },
                { v: "98.7%", t: "Đúng giờ" },
                { v: "4.8/5", t: "Đánh giá" },
              ].map((x) => (
                <div key={x.t} className="p-4 rounded-xl bg-white/80 border border-slate-200 text-center shadow-[0_12px_40px_rgba(2,6,23,.08)]">
                  <div className="text-2xl font-extrabold text-blue-600">{x.v}</div>
                  <div className="text-xs text-slate-500">{x.t}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a href="#booking" className="px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 shadow-[0_12px_40px_rgba(2,6,23,.08)]">
                Đặt xe ngay
              </a>
              <a href="#pricing" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_10px_24px_rgba(37,99,235,.32)] btn-shine">
                Xem bảng giá
              </a>
            </div>
          </div>

          <div id="booking" className="glass rounded-2xl border border-white/80 p-6 lg:p-7">
            <div className="text-lg font-semibold text-blue-600">Đặt chuyến nhanh</div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600">Nơi gửi hàng</label>
                <input className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="VD: 12 Nguyễn Huệ, Q.1, HCM" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Nơi nhận hàng</label>
                <input className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="VD: KCN Long Thành, Đồng Nai" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Ngày & giờ</label>
                <input type="datetime-local" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Loại xe</label>
                <select className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option>Van 500kg</option><option>Xe tải 750kg</option><option>Xe tải 1 tấn</option><option>Xe tải 1.5 tấn</option><option>Xe tải 2.5 tấn</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Trọng lượng ước tính</label>
                <input type="number" min="1" placeholder="kg" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Ghi chú</label>
                <input placeholder="Hàng dễ vỡ / có bốc xếp" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <a href="#pricing" className="text-sm font-medium text-blue-600 underline underline-offset-4">Ước tính chi phí</a>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-[0_10px_24px_rgba(37,99,235,.32)] btn-shine btn-blue">
                <Search className="w-4 h-4" /> Tìm chuyến
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Giá hiển thị trước khi đặt, có thể thay đổi theo km, tải trọng và dịch vụ thêm.</p>
          </div>
        </div>
      </div>

      <div className="h-10 section-curve bg-white" />
    </section>
  );
}
