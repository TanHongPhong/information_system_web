import { useEffect } from "react";
import feather from "feather-icons";

export default function StatusTimeline({ segments = 4, fillPct = 0, milestones = [], etaLabel = "", steps = [] }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  return (
    <div id="statusCard" className="bg-white border border-slate-200 rounded-2xl p-3" style={{ display: "flex", flexDirection: "column" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Status</h3>
        <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-sm">Làm mới</button>
      </div>

      {/* Milestones */}
      <div className="mt-3 grid grid-cols-4 text-xs text-slate-600">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={[
            i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center",
          ].join(" ")}>
            {milestones[i] || ""}
          </span>
        ))}
      </div>

      {/* Segmented bar */}
      <div className="mt-2 relative rounded-full h-[30px] bg-[#ecf2ff] shadow-inner">
        <div className="absolute inset-0 rounded-full"
             style={{
               width: `${Math.max(0, Math.min(100, fillPct))}%`,
               background: "linear-gradient(90deg,#0B43C6 0%,#2F78FF 45%,#8AB8FF 100%)",
               boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), 0 4px 14px rgba(46,119,255,.25)",
             }} />
        {Array.from({ length: segments - 1 }).map((_, i) => (
          <span key={i}
                className="absolute top-1 bottom-1 bg-slate-300 rounded"
                style={{ left: `${((i + 1) / segments) * 100}%`, width: 2 }} />
        ))}
        <div className="absolute top-1/2 -translate-y-1/2 right-2 px-2 py-1 rounded-full bg-[#e7f0ff] text-[#0B43C6] text-[12px] font-bold shadow">
          {etaLabel}
        </div>
      </div>

      {/* Steps */}
      <div className="mt-3 steps-wrap pr-1">
        <div className="steps-outer">
          <ol className="steps">
            {steps.map((s, idx) => (
              <li key={idx}>
                <span className={`dot ${s.type}${s.dim ? " dim" : ""}`} />
                <div className={[
                  "card step-card p-3 rounded-2xl",
                  s.type === "current" ? "ring-1 ring-blue-200 bg-blue-50/60" : s.dim ? "ring-1 ring-slate-200 bg-slate-50" : "ring-1 ring-slate-200 bg-white",
                ].join(" ")}>
                  <div className="flex items-center justify-between">
                    <span className={s.type === "future" ? "text-slate-600 font-semibold" : "text-slate-900 font-semibold"}>{s.title}</span>
                    <span className={`inline-flex items-center gap-1 step-meta ${s.type === "current" ? "text-slate-700" : s.type === "future" ? "text-slate-500" : "text-slate-600"}`}>
                      <i data-feather="calendar" className="w-4 h-4" /> {s.time}
                    </span>
                  </div>
                  <div className={`mt-1 step-meta ${s.type === "current" ? "text-slate-700" : s.type === "future" ? "text-slate-600" : "text-slate-600"}`}>{s.note}</div>
                  {s.chips?.length ? (
                    <div className="mt-2 flex items-center gap-2">
                      {s.chips.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-white text-blue-700 ring-1 ring-blue-300 inline-flex items-center gap-1">
                          {i === 0 && <i data-feather="clock" className="w-4 h-4" />}{c}
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

      {/* local styles for timeline */}
      <style>{`
        #statusCard .steps-wrap{ overflow:visible !important; }
        #statusCard .steps-outer{ display:flex; justify-content:center; width:100%; }
        #statusCard .steps{ --nudge: 8px; position:relative; width:100%; max-width:380px; margin:0 auto; padding-left:0; transform: translateX(calc(var(--nudge) * -1)); }
        #statusCard .steps li{ position:relative; padding-left:48px; margin-bottom:12px; }
        #statusCard .steps li > .dot{ position:absolute; left:9px; top:18px; width:10px; height:10px; border-radius:9999px; background:#fff; border:2px solid #93c5fd; box-shadow:0 0 0 2px #fff; }
        #statusCard .steps li > .dot.done{ background:#1E66FF; border-color:#1E66FF; }
        #statusCard .steps li > .dot.current{ background:#1E66FF; border-color:#1E66FF; box-shadow:0 0 0 4px rgba(30,102,255,.16); }
        #statusCard .steps li > .dot.future{ border-color:#cbd5e1; }
        #statusCard .step-card{ margin-left:0; }
        #statusCard .step-meta{ font-size:12px; }
      `}</style>
    </div>
  );
}
