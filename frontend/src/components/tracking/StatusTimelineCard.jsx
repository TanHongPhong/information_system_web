export default function StatusTimelineCard({ progress = 0.6, route = [] }) {
  const pct = Math.max(0, Math.min(1, progress));
  const etaRight = `max(8px, calc(100% - ${pct * 100}% + 8px))`;

  const steps = [
    {
      title: "Departure",
      time: "17/7/2024, 10:00",
      address: "279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM",
      state: "done",
    },
    {
      title: "Stop",
      time: "17/7/2024, 12:00",
      address: "76 Nguyễn Tất Thành, Quảng Ngãi",
      state: "current",
      chips: [
        { label: "Đang xử lý (15’)", type: "primary" },
        { label: "ON TIME", type: "ok" },
      ],
    },
    {
      title: "Stop",
      time: "17/7/2024, 20:00",
      address: "36 Phạm Văn Đồng, Thanh Hóa",
      state: "future",
    },
    {
      title: "Arrival",
      time: "21/7/2024, 10:00",
      address: "777 Lê Lợi, P.3, Q.1, TP.Hà Nội",
      state: "future",
      faint: true,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Status</h3>
        <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">Làm mới</button>
      </div>

      {/* Route labels */}
      <div className="mt-3 grid grid-cols-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">{route[0] || "—"}</span>
        <span className="text-center">{route[1] || "—"}</span>
        <span className="text-center">{route[2] || "—"}</span>
        <span className="text-right">{route[3] || "—"}</span>
      </div>

      {/* Progress segmented bar */}
      <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: `${pct * 100}%`,
            background:
              "linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25)",
          }}
        />
        <span className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-slate-300 rounded" />
        <span className="absolute top-1 bottom-1 left-1/2 w-[2px] bg-slate-300 rounded" />
        <span className="absolute top-1 bottom-1 left-[75%] w-[2px] bg-slate-300 rounded" />
        <div
          className="absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-[#e7f0ff] text-[#0B43C6] text-[12px] font-bold shadow"
          style={{ right: etaRight }}
        >
          12 Hrs Left
        </div>
      </div>

      {/* Steps */}
      <div className="mt-3">
        <ol className="space-y-3">
          {steps.map((s, idx) => (
            <li key={idx} className="relative pl-10">
              <span
                className={[
                  "absolute left-2 top-3 w-2.5 h-2.5 rounded-full border-2",
                  s.state === "done" && "bg-blue-600 border-blue-600",
                  s.state === "current" && "bg-blue-600 border-blue-600 shadow-[0_0_0_4px_rgba(30,102,255,.16)]",
                  s.state === "future" && "bg-white border-slate-300",
                ].filter(Boolean).join(" ")}
              />
              <div
                className={[
                  "rounded-2xl p-3 ring-1",
                  s.state === "current" ? "ring-blue-200 bg-blue-50/60" : "ring-slate-200 bg-white",
                  s.faint && "bg-slate-50"
                ].filter(Boolean).join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className={s.state === "future" ? "text-slate-600 font-semibold" : "text-slate-900 font-semibold"}>
                    {s.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-slate-600">
                    📅 {s.time}
                  </span>
                </div>
                <div className={"mt-1 text-[12px] " + (s.state === "future" ? "text-slate-600" : "text-slate-700")}>
                  {s.address}
                </div>
                {s.chips && (
                  <div className="mt-2 flex items-center gap-2">
                    {s.chips.map((c, i) => (
                      <span
                        key={i}
                        className={
                          "text-[10px] px-2 py-1 rounded-full " +
                          (c.type === "primary"
                            ? "bg-white text-blue-700 ring-1 ring-blue-300"
                            : "bg-green-100 text-green-700 ring-1 ring-green-300")
                        }
                      >
                        {c.type === "primary" ? "⏱️ " : ""}{c.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
