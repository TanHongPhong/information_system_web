import React from "react";

export default function OrderSearch({ featured, list }) {
  return (
    <section className="col-span-12 lg:col-span-3">
      <div className="sticky" style={{ top: "calc(var(--topbar-h,64px) + 16px)" }}>
        <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
            {/* Header + filters */}
            <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold tracking-tight">ORDER SEARCH</h3>
                <div className="relative flex-1">
                  <input
                    className="h-9 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Tìm kiếm"
                  />
                  <i data-feather="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Active</button>
                <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Arriving</button>
                <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Departed</button>
              </div>
            </div>

            {/* Featured shipment */}
            <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF]">
                    <i data-feather="truck" className="w-4 h-4" />
                  </span>
                  <div className="text-sm min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href="#" className="font-semibold text-slate-800">
                        {featured.title}
                      </a>
                      <span className="badge bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70">ARRIVING</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug">
                      <div>{featured.orderCode}</div>
                      <div className="whitespace-nowrap">{featured.capacityNote}</div>
                    </div>
                  </div>
                </div>
                <button
                  title="Đang theo dõi"
                  className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#1E66FF] text-white ring-1 ring-blue-500/30 hover:brightness-105"
                >
                  <i data-feather="eye" className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {featured.route.map((row, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {row}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-4">
                  <img
                    src={featured.mapThumb}
                    alt="Mini map"
                    className="w-full h-20 rounded-lg object-cover border border-slate-200"
                  />
                </div>
              </div>
            </article>

            {/* More shipments */}
            <div className="mt-3 space-y-3">
              {list.map((s) => (
                <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-50 text-[#1E66FF]">
                        <i data-feather="truck" className="w-4 h-4" />
                      </span>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href="#" className="font-semibold text-slate-800">
                            {s.title}
                          </a>
                          <span className="badge bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70">ARRIVING</span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          <div>{s.orderCode}</div>
                          <div>{s.capacityNote}</div>
                        </div>
                      </div>
                    </div>
                    <button title="Theo dõi" className="shrink-0 w-8 h-8 rounded-md grid place-items-center ring-1 ring-slate-200 hover:bg-slate-50">
                      <i data-feather="eye" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <a className="text-[11px] text-blue-600 hover:underline" href="#">
                      Chi tiết
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
