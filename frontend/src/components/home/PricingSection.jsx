import React from "react";

const PLANS = [
  { title:"Van", price:"~105k", unit:" / 4km", bullets:["≤ 500kg • hàng nhỏ gọn","Giao nội thành nhanh","Phí chờ minh bạch"], featured:false },
  { title:"Xe tải nhỏ", price:"~150k", unit:" / 4km", bullets:["750kg – 1 tấn","Đồ điện tử, văn phòng","Tuỳ chọn bốc xếp"], featured:true },
  { title:"Xe tải trung", price:"~220k", unit:" / 4km", bullets:["1.5 – 2.5 tấn","Hàng cồng kềnh, máy móc","Giao liên tỉnh ổn định"], featured:false },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Bảng giá theo tải trọng</h2>
          <a href="#" className="text-sm font-light text-blue-700 underline">Cách tính phí</a>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {PLANS.map((p)=>(
            <div key={p.title}
                 className={`rounded-2xl bg-white p-6 transition ${p.featured ? "border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-[0_10px_24px_rgba(37,99,235,.32)]" : "border border-slate-200 hover:shadow-[0_10px_24px_rgba(37,99,235,.32)]"}`}>
              {p.featured ? (
                <div className="inline-flex text-xs font-semibold text-blue-700 bg-white/70 border border-blue-100 px-2 py-0.5 rounded-full">Phổ biến</div>
              ) : (
                <div className="text-sm font-semibold text-blue-700">{p.title}</div>
              )}
              {p.featured && <div className="mt-2 text-sm font-semibold text-blue-700">{p.title}</div>}
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{p.price}<span className="text-base text-slate-500">{p.unit}</span></div>
              <ul className="mt-3 text-sm subtitle-soft space-y-1">{p.bullets.map((b)=><li key={b}>{b}</li>)}</ul>
              <button className="mt-4 w-full py-2.5 rounded-xl text-white font-semibold btn-shine bg-green-600 hover:bg-green-700">Chọn</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
