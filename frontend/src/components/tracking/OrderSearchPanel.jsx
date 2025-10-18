export default function OrderSearchPanel() {
  const list = ["0124","0125","0126","0127","0128","0129","0130","0131","0132","0133"];
  return (
    <div className="sticky top-4">
      <div className="max-h-[calc(100dvh-96px)] overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
          {/* Header search + filter chips */}
          <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold tracking-tight">ORDER SEARCH</h3>
              <div className="relative flex-1">
                <input
                  className="h-9 w-full rounded-lg border border-slate-300 pl-3 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm kiếm"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Active</button>
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Arriving</button>
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">Departed</button>
            </div>
          </div>

          {/* Featured item */}
          <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm">🚚</span>
                <div className="text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href="#" className="font-semibold text-slate-800">ShipID-0123</a>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ring-1 ring-blue-200/70">ARRIVING</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    <div>DL04MP7045</div>
                    <div className="whitespace-nowrap">Tải trọng tối đa 6.5 tấn</div>
                  </div>
                </div>
              </div>
              <button
                title="Đang theo dõi"
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-blue-600 text-white ring-1 ring-blue-500/30"
              >👁️</button>
            </div>

            <div className="mt-3 grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Departure: TP.Hồ Chí Minh</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Stop 01: Quảng Ngãi</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Stop 02: Thanh Hóa</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />Arrival: Hà Nội</li>
                </ul>
              </div>
              <div className="col-span-4">
                <img
                  src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                  alt="Mini map"
                  className="w-full h-20 rounded-lg object-cover border border-slate-200"
                />
              </div>
            </div>
          </article>

          {/* More items */}
          <div className="mt-3 space-y-3">
            {list.map((id) => (
              <article key={id} className="rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-300">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 text-sm">🚚</span>
                    <div className="text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href="#" className="font-semibold text-slate-800">ShipID-{id}</a>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ring-1 ring-blue-200/70">ARRIVING</span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        <div>DL04MP7045</div>
                        <div>Tải trọng tối đa 6.5 tấn</div>
                      </div>
                    </div>
                  </div>
                  <button title="Theo dõi" className="shrink-0 w-8 h-8 rounded-md grid place-items-center ring-1 ring-slate-200 hover:bg-slate-50">👁️</button>
                </div>
                <div className="mt-2 text-right">
                  <a className="text-[11px] text-blue-600 hover:underline" href="#">Chi tiết</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
