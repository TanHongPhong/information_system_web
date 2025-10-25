export default function Testimonials() {
  const data = [
    { stars: "★★★★★", text: "Tài xế đúng giờ, giao HCM ↔ Biên Hòa nhẹ nhàng, giá rõ ràng.", who: "Chị Mai • Nội thất" },
    { stars: "★★★★★", text: "Có bốc xếp tận nơi, thao tác đặt xe rất nhanh.", who: "Anh Toàn • Văn phòng phẩm" },
    { stars: "★★★★★", text: "Theo dõi realtime & lưu lịch sử đơn rất tiện.", who: "Công ty ABC • Kho Sóng Thần" },
  ];
  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-brand-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Khách hàng nói gì?</h2>
          <a href="#" className="text-sm text-blue-600 underline">Xem thêm</a>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {data.map((d, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur hover:shadow-[0_10px_24px_rgba(37,99,235,.32)] transition">
              <div className="text-amber-500" aria-label="5 sao">{d.stars}</div>
              <p className="mt-2 text-sm text-slate-700">{d.text}</p>
              <div className="mt-3 text-xs text-slate-500">{d.who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
