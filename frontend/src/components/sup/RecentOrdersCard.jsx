import AreaMiniChart from "./AreaMiniChart";

export default function RecentOrdersCard() {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Recent Orders</h3>
          <p className="text-sm text-slate-500">Thống kê đơn hàng trong tháng.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
          Tháng 10
          <span className="text-slate-500">▾</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-end">
        <ul className="col-span-12 sm:col-span-5 space-y-4">
          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-600">🚚</span>
            <div>
              <div className="text-sm text-slate-500">Đang hoạt động</div>
              <div className="font-bold text-xl text-slate-800">720</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-amber-200 bg-amber-50 text-amber-600">⏳</span>
            <div>
              <div className="text-sm text-slate-500">Chờ xác nhận</div>
              <div className="font-bold text-xl text-slate-800">120</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">✅</span>
            <div>
              <div className="text-sm text-slate-500">Đã xác nhận</div>
              <div className="font-bold text-xl text-slate-800">220</div>
            </div>
          </li>
          <div className="pt-2 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
            ↗ <span>+40% so với tháng trước</span>
          </div>
        </ul>

        <div className="col-span-12 sm:col-span-7">
          <AreaMiniChart />
        </div>
      </div>
    </section>
  );
}
