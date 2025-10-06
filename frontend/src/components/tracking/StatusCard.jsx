import React from "react";

export default function StatusCard({ progress = 0.6, steps = [], mapHeight }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const etaLeft = `calc(${Math.min(95, pct)}% - 40px)`;

  return (
    <>
      {/* Scoped CSS cho Status */}
      <style>{`
        #statusCard .steps-wrap{ overflow:visible !important; }
        #statusCard .steps-outer{ display:flex; justify-content:center; width:100%; }
        #statusCard .steps{ --nudge: 8px; position:relative; width:100%; max-width:380px; margin:0 auto; padding-left:0; transform: translateX(calc(var(--nudge) * -1)); }
        #statusCard .rail{ position:absolute; left:16px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#93c5fd 0%,#1e66ff 45%,#e5e7eb 45%); }
        #statusCard .steps li{ position:relative; padding-left:48px; margin-bottom:12px; }
        #statusCard .steps li > .dot{ position:absolute; left:9px; top:18px; width:10px; height:10px; border-radius:9999px; background:#fff; border:2px solid #93c5fd; box-shadow:0 0 0 2px #fff; }
        #statusCard .steps li > .dot.done{ background:#1E66FF; border-color:#1E66FF; }
        #statusCard .steps li > .dot.current{ background:#1E66FF; border-color:#1E66FF; box-shadow:0 0 0 4px rgba(30,102,255,.16); }
        #statusCard .steps li > .dot.future{ border-color:#cbd5e1; }
        #statusCard .step-card{ margin-left:0; }
        #statusCard .step-meta{ font-size:12px; }
      `}</style>

      <div id="statusCard" className="bg-white border border-slate-200 rounded-2xl p-3" style={mapHeight ? { height: mapHeight } : undefined}>
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

        {/* Progress bar */}
        <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25)",
            }}
          />
          <span className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-slate-300 rounded" />
          <span className="absolute top-1 bottom-1 left-1/2 w-[2px] bg-slate-300 rounded" />
          <span className="absolute top-1 bottom-1 left-[75%] w-[2px] bg-slate-300 rounded" />

          <div
            className="absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-[#e7f0ff] text-[#0B43C6] text-[12px] font-bold shadow"
            style={{ left: etaLeft }}
          >
            12 Hrs Left
          </div>
        </div>

        {/* Steps */}
        <div className="mt-3 steps-wrap pr-1">
          <div className="steps-outer">
            <ol className="steps">
              {/* rail */}
              <span className="rail" />
              {steps.map((s, idx) => (
                <li key={idx}>
                  <span className={`dot ${s.state}`} />
                  <div
                    className={[
                      "card step-card p-3 rounded-2xl",
                      s.state === "current"
                        ? "ring-1 ring-blue-200 bg-blue-50/60"
                        : s.state === "done"
                        ? "ring-1 ring-slate-200 bg-white"
                        : s.state === "future" && s.variant === "muted"
                        ? "ring-1 ring-slate-200 bg-slate-50"
                        : "ring-1 ring-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className={["font-semibold", s.state === "future" ? "text-slate-800" : "text-slate-900"].join(" ")}>
                        {s.title}
                      </span>
                      <span
                        className={[
                          "inline-flex items-center gap-1 step-meta",
                          s.state === "current" ? "text-slate-700" : s.state === "future" ? "text-slate-500" : "text-slate-600",
                        ].join(" ")}
                      >
                        <i data-feather="calendar" className="w-4 h-4" /> {s.time}
                      </span>
                    </div>
                    <div className={["mt-1 step-meta", s.state === "future" ? "text-slate-600" : s.state === "current" ? "text-slate-700" : "text-slate-600"].join(" ")}>
                      {s.address}
                    </div>

                    {s.badges?.length ? (
                      <div className="mt-2 flex items-center gap-2">
                        {s.badges.map((b, i) => (
                          <span
                            key={i}
                            className={[
                              "text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1",
                              b.kind === "primary"
                                ? "bg-white text-blue-700 ring-1 ring-blue-300"
                                : "bg-green-100 text-green-700 ring-1 ring-green-300",
                            ].join(" ")}
                          >
                            {b.icon ? <i data-feather={b.icon} className="w-4 h-4" /> : null}
                            {b.text}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
