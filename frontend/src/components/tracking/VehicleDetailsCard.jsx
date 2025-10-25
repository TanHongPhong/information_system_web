export default function VehicleDetailsCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Vehicle Details</h3>
        <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">
          Xem thông tin xe
        </button>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full ring-1 ring-slate-200 grid place-items-center">
          <span className="text-[10px] font-semibold text-slate-500">LOGO</span>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Container 1000KG</div>
          <div className="text-[12px] text-slate-500">
            Biển số: <span className="text-slate-700">50AĐ-767.72</span>
          </div>
          <div className="text-[12px] text-slate-500">
            Shipment ID: <span className="text-slate-700">SHIP001234</span>
          </div>
          <div className="text-[12px] text-slate-500">
            Mã đơn hàng: <span className="text-slate-700">DL04MP7045</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl ring-1 ring-slate-200 overflow-hidden bg-white">
        <img
          src="https://png.pngtree.com/background/20250120/original/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-picture-image_13354856.jpg"
          alt="Truck"
          className="block w-full h-auto object-contain bg-white"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
        <div>Trọng tải <span className="font-semibold text-slate-800">6.5 tấn</span></div>
        <div className="text-right">Chiều rộng hàng <span className="font-semibold text-slate-800">4.8 mét</span></div>
        <div>Thể tích hàng <span className="font-semibold text-slate-800">35,393 lít</span></div>
        <div className="text-right">Chiều dài hàng <span className="font-semibold text-slate-800">11.7 mét</span></div>
      </div>
    </div>
  );
}
