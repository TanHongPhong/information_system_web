import FeatherIcon from "./FeatherIcon";

export default function CargoOverview() {
  return (
    <section className="bg-white rounded-xl2 shadow-soft p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Hàng trong xe</h2>
        <span className="text-xs text-slate-500">Cập nhật: 10:30</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 p-2 text-center">
          <p className="text-[11px] text-slate-500">Số kiện</p>
          <p className="text-sm font-bold">24</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-2 text-center">
          <p className="text-[11px] text-slate-500">Khối lượng</p>
          <p className="text-sm font-bold">7.2 tấn</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-2 text-center">
          <p className="text-[11px] text-slate-500">Thể tích</p>
          <p className="text-sm font-bold">28 m³</p>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        <li className="py-3 flex items-start gap-3">
          <span className="mt-0.5 inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-sky-50">
            <FeatherIcon name="cpu" className="w-4 h-4 text-brand-600" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Điện tử</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">12 kiện</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Laptop, màn hình — yêu cầu chống sốc, xếp giữa xe
            </p>
          </div>
        </li>

        <li className="py-3 flex items-start gap-3">
          <span className="mt-0.5 inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-sky-50">
            <FeatherIcon name="box" className="w-4 h-4 text-brand-600" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Thực phẩm khô</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                8 thùng
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Bảo quản khô ráo — ưu tiên dỡ ở điểm 1
            </p>
          </div>
        </li>

        <li className="py-3 flex items-start gap-3">
          <span className="mt-0.5 inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-sky-50">
            <FeatherIcon name="alert-triangle" className="w-4 h-4 text-brand-600" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Dễ vỡ</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                4 kiện
              </span>
            </div>
            <p className="text-xs text-rose-600 mt-1">
              ⚠️ Dán nhãn FRAGILE — buộc nép sát vách, chèn xốp
            </p>
          </div>
        </li>
      </ul>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
          Có hàng dễ vỡ
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Niêm phong đủ
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
          Lộ trình 2 điểm dỡ
        </span>
      </div>
    </section>
  );
}
