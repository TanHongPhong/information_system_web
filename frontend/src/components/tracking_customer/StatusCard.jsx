export default function StatusCard() {
  return (
    <div
      id="statusCard"
      className="bg-white border border-slate-200 rounded-2xl p-3"
      style={{ height: "var(--map-h)", display: "flex", flexDirection: "column", "--nudge": "8px" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Status</h3>
        <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">Làm mới</button>
      </div>

      <div className="mt-3 grid grid-cols-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">TP.HCM</span>
        <span className="text-center">Quảng Ngãi</span>
        <span className="text-center">Thanh Hóa</span>
        <span className="text-right">Hà Nội</span>
      </div>

      <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
        <div
          id="segFill"
          className="absolute inset-0 rounded-full"
          style={{
            width: "60%",
            background: "linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25)",
          }}
        />
        <span className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-slate-300 rounded" />
        <span className="absolute top-1 bottom-1 left-1/2 w-[2px] bg-slate-300 rounded" />
        <span className="absolute top-1 bottom-1 left-[75%] w-[2px] bg-slate-300 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 right-2 px-2 py-1 rounded-full bg-[#e7f0ff] text-[#0B43C6] text-[12px] font-bold shadow">
          12 Hrs Left
        </div>
      </div>

      <div className="mt-3 steps-wrap pr-1">
        <div className="steps-outer">
          <ol className="steps">
            <li>
              <span className="dot done" />
              <div className="card step-card ring-1 ring-slate-200 bg-white p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-semibold">Departure</span>
                  <span className="inline-flex items-center gap-1 step-meta text-slate-600">
                    <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 10:00
                  </span>
                </div>
                <div className="mt-1 step-meta text-slate-600">
                  279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM
                </div>
              </div>
            </li>

            <li>
              <span className="dot current" />
              <div className="card step-card ring-1 ring-blue-200 bg-blue-50/60 p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-semibold">Stop</span>
                  <span className="inline-flex items-center gap-1 step-meta text-slate-700">
                    <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 12:00
                  </span>
                </div>
                <div className="mt-1 step-meta text-slate-700">76 Nguyễn Tất Thành, Quảng Ngãi</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white text-blue-700 ring-1 ring-blue-300 inline-flex items-center gap-1">
                    <i data-feather="clock" className="w-4 h-4" /> Đang xử lý (15’)
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-300">
                    ON TIME
                  </span>
                </div>
              </div>
            </li>

            <li>
              <span className="dot future" />
              <div className="card step-card ring-1 ring-slate-200 bg-white p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-semibold">Stop</span>
                  <span className="inline-flex items-center gap-1 step-meta text-slate-500">
                    <i data-feather="calendar" className="w-4 h-4" /> 17/7/2024, 20:00
                  </span>
                </div>
                <div className="mt-1 step-meta text-slate-600">36 Phạm Văn Đồng, Thanh Hóa</div>
              </div>
            </li>

            <li>
              <span className="dot future" style={{ opacity: ".85" }} />
              <div className="card step-card ring-1 ring-slate-200 bg-slate-50 p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Arrival</span>
                  <span className="inline-flex items-center gap-1 step-meta text-slate-500">
                    <i data-feather="calendar" className="w-4 h-4" /> 21/7/2024, 10:00
                  </span>
                </div>
                <div className="mt-1 step-meta text-slate-500">777 Lê Lợi, P.3, Q.1, TP.Hà Nội</div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
