import React from "react";

export default function OrdersGrid({ orders }) {
  return (
    <section className="pt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {orders.map((o) => (
        <article key={o.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500">ID:{o.id}</span>
            <button className="text-slate-400" aria-label="More">...</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#E9F2FF] grid place-items-center text-[#4A90E2]">📦</div>
            <div className="text-[18px]">{Number(o.weight).toLocaleString("vi-VN")} kg</div>
          </div>
          <div className="text-[12px] text-slate-600">
            <div>{o.route}</div>
            <div>{o.date}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
