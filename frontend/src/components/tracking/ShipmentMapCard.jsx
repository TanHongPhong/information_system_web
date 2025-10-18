export default function ShipmentMapCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Shipment ID</div>
          <h2 className="text-xl font-semibold">SHIPID-0123</h2>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100">
          📘 <span className="text-sm font-medium">Documentation</span>
        </button>
      </div>

      {/* Static map + route overlay (SVG) */}
      <div className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-slate-200 h-[520px]">
        <img
          src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 640" preserveAspectRatio="none">
          <polyline
            points="140,520 210,465 290,410 350,370 420,330 490,290 560,250 620,220 690,190 760,160"
            fill="none" stroke="#1E66FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
          />
          <circle cx="140" cy="520" r="12" fill="#1E66FF" />
          <circle cx="760" cy="160" r="12" fill="#1E66FF" />
        </svg>
      </div>
    </div>
  );
}
