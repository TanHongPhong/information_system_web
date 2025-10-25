import DonutMiniChart from "./DonutMiniChart";

export default function FleetStatusCard() {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Fleet Status</h3>
          <p className="text-sm text-slate-500">Tình trạng các phương tiện.</p>
        </div>
        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 sm:col-span-5">
          <div className="relative aspect-square max-w-[190px] mx-auto">
            <DonutMiniChart />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">93</div>
                <div className="text-slate-500 text-xs tracking-wide">TỔNG SỐ XE</div>
              </div>
            </div>
          </div>
        </div>

        <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0b2875]" />Đang vận chuyển <span className="ml-auto font-semibold">40</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Nhận hàng bị trì hoãn <span className="ml-auto font-semibold">23</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2563eb]" />Sẵn sàng nhận hàng <span className="ml-auto font-semibold">12</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#60a5fa]" />Gửi hàng bị trì hoãn <span className="ml-auto font-semibold">12</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Sẵn sàng gửi hàng <span className="ml-auto font-semibold">3</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d97706]" />Đơn hàng bị huỷ <span className="ml-auto font-semibold">3</span></li>
        </ul>
      </div>
    </section>
  );
}
