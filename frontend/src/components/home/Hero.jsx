import { Zap } from "./Icons";
import BookingCard from "./BookingCard";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[560px] h-[560px] bg-gradient-to-br from-brand-100 to-brand-50 rounded-blob animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-[620px] h-[620px] bg-gradient-to-br from-brand-100 to-white rounded-blob animate-blob [animation-delay:2s]" />
        <div className="absolute inset-0 bg-dots opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fadeIn">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4" /> Nhanh — Minh bạch — Đúng giờ
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight title-grad leading-tight">
              Đặt xe chở hàng nhanh — minh bạch & đúng giờ
            </h1>
            <p className="mt-4 subtitle-soft text-base leading-relaxed">
              Kết nối đội xe 500kg – 2.5 tấn. Giá theo km & tải trọng rõ ràng, theo dõi realtime, hỗ trợ nội thành & liên tỉnh (HCM ↔ Đồng Nai, Bình Dương…).
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
              <StatBox value="1.2k+" label="Tài xế đối tác" pulse />
              <StatBox value="98.7%" label="Đúng giờ" />
              <StatBox value="4.8/5" label="Đánh giá" />
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a href="#booking" className="px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold border border-brand-200 hover:bg-brand-50 shadow-[0_12px_40px_rgba(2,6,23,.08)]">Đặt xe ngay</a>
              <a href="#pricing" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_12px_40px_rgba(2,6,23,.08)] btn-shine">Xem bảng giá</a>
            </div>
          </div>

          <BookingCard />
        </div>
      </div>

      <div className="h-10 section-curve bg-white" />
    </section>
  );
}

function StatBox({ value, label, pulse }) {
  return (
    <div className={`p-4 rounded-xl bg-white/80 border border-slate-200 text-center shadow-[0_12px_40px_rgba(2,6,23,.08)] ${pulse ? "animate-pulseUp" : ""}`}>
      <div className="text-2xl font-extrabold text-blue-600">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
