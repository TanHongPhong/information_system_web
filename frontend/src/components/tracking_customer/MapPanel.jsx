export default function MapPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-sm text-slate-500">Đang theo dõi</div>
          <h2 className="text-xl font-semibold">ORDERID 0112</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-sm inline-flex items-center gap-1">
            <i data-feather="check-circle" className="w-4 h-4" />Không trễ
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-sm inline-flex items-center gap-1">
            <i data-feather="clock" className="w-4 h-4" />ETA 3h15’
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-sm inline-flex items-center gap-1">
            <i data-feather="navigation" className="w-4 h-4" />78 km còn lại
          </span>
        </div>
      </div>

      <div id="mapPanel" className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-slate-200 h-[520px]">
        <img
          src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 640" preserveAspectRatio="none">
          <polyline
            points="120,520 220,470 300,430 370,390 450,350 520,310 590,270 650,230 730,190"
            fill="none"
            stroke="#2563eb"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="120" cy="520" r="12" fill="#2563eb" />
          <circle cx="730" cy="190" r="12" fill="#2563eb" />
        </svg>
        <div className="absolute left-3 bottom-3 bg-white/95 backdrop-blur rounded-xl shadow-soft ring-1 ring-slate-200 p-3 flex items-center gap-3">
          <img src="https://i.pravatar.cc/48?img=12" className="w-10 h-10 rounded-full" alt="driver" />
          <div className="text-sm">
            <div className="font-semibold">Tài xế: Quang Trè</div>
            <div className="text-xs text-slate-500">Xe tải 6.5T • DL04MP7045</div>
          </div>
          <a href="tel:0900000000" className="ml-2 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs inline-flex items-center gap-1">
            <i data-feather="phone" className="w-4 h-4" />Gọi
          </a>
        </div>
      </div>
    </div>
  );
}
