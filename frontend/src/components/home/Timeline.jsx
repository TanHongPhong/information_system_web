export default function Timeline() {
  return (
    <section className="py-12 lg:py-16 bg-brand-25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Quy trình 3 bước</h2>
        <ol className="mt-8 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={i} className="p-6 bg-white rounded-2xl border border-slate-200 relative overflow-hidden">
              <span className="absolute -top-5 -right-5 w-20 h-20 bg-brand-100 rounded-full" />
              <div className="flex items-center gap-2 text-brand-700 font-semibold">
                <span className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">{i + 1}</span>
                {s.title}
              </div>
              <p className="mt-2 text-sm subtitle-soft">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
const steps = [
  { title: "Nhập điểm đi/đến", desc: "Địa chỉ lấy/giao + người nhận." },
  { title: "Chọn xe & xem giá", desc: "Gợi ý loại xe theo cân nặng." },
  { title: "Xác nhận & theo dõi", desc: "Realtime ETA, trạng thái đơn." },
];
