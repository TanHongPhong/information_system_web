import FeatherIcon from "./FeatherIcon";

export default function PlateRoute() {
  return (
    <section className="bg-white rounded-xl2 shadow-soft p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-sky-50">
            <FeatherIcon name="credit-card" className="w-5 h-5 text-brand-600" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Biển số</p>
            <p className="text-2xl font-extrabold tracking-widest text-slate-900">51C-789.45</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Đang hoạt động
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Tuyến đường</p>
        <div className="bg-brand-25 border border-brand-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                TP. Hồ Chí Minh
              </span>
            </div>
            <div className="mx-2 shrink-0 text-slate-400">
              <FeatherIcon name="arrow-right" className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                Hà Nội
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 active:scale-[.98]">
              <FeatherIcon name="play" className="w-4 h-4" /> Xuất phát
            </button>
            <button className="inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200 active:scale-[.98]">
              <FeatherIcon name="home" className="w-4 h-4" /> Đã tới kho
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
