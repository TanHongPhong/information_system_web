import React from "react";

export default function OrdersGrid({ orders }) {
  return (
    <section className="pt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {orders.map((o) => (
        <article
          key={o.id}
          className="bg-white border border-[#EAEBF0] rounded-[12px] p-4 flex flex-col gap-3 transition-all hover:-translate-y-[4px] hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] cursor-grab"
        >
          <div className="flex items-center justify-between text-[12px] text-[#697386]">
            <span style={{ fontWeight: 400 }}>ID:{o.id}</span>
            <button
              className="text-[#A0AEC0]"
              style={{ fontWeight: 400 }}
              aria-label="More"
            >
              ...
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 min-w-[36px] rounded-[6px] grid place-items-center bg-[#E9F2FF] text-[#4A90E2] text-[16px] leading-none">
              📦
            </div>
            <div
              className="text-[18px] text-[#1C2A44]"
              style={{ fontWeight: 400 }}
            >
              {Number(o.weight).toLocaleString("vi-VN")} kg
            </div>
          </div>

          <div className="text-[12px] text-[#697386] leading-[1.4] space-y-1">
            <div style={{ fontWeight: 400 }}>{o.route}</div>
            <div style={{ fontWeight: 400 }}>{o.date}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
