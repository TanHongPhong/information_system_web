import React from "react";

const STEPS = [
  { n:1, t:"Nhập điểm đi/đến", d:"Địa chỉ lấy/giao + người nhận." },
  { n:2, t:"Chọn xe & xem giá", d:"Gợi ý loại xe theo cân nặng." },
  { n:3, t:"Xác nhận & theo dõi", d:"Realtime ETA, trạng thái đơn." },
];

export default function TimelineSection() {
  return (
    <section className="py-12 lg:py-16 bg-[rgb(247,250,255)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Quy trình 3 bước</h2>
        <ol className="mt-8 grid md:grid-cols-3 gap-6">
          {STEPS.map((s)=>(
            <li key={s.n} className="p-6 bg-white rounded-2xl border border-slate-200 relative overflow-hidden">
              <span className="absolute -top-5 -right-5 w-20 h-20 bg-blue-100 rounded-full" />
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <span className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">{s.n}</span> {s.t}
              </div>
              <p className="mt-2 text-sm subtitle-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
