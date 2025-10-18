import MiniMap from "./MiniMap";

export default function OrderRequestCard({
  id, time, from, to, initials, name, highlight,
  latA, lngA, latB, lngB,
}) {
  return (
    <article className={`rounded-xl p-4 relative overflow-hidden ${
      highlight ? "border-2 border-amber-300 bg-amber-50/70" : "border border-slate-200 bg-white hover:border-blue-300"
    }`}>
      {highlight && (
        <div className="absolute top-0 right-0 text-xs font-bold text-amber-800 bg-amber-300 px-2 py-0.5 rounded-bl-lg">
          NEW
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="font-semibold text-slate-700">{id}</div>
        <div>{time}</div>
      </div>

      <div className="mt-2 grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-2 text-sm">
          <div>
            <div className="text-xs text-slate-500">Từ</div>
            <div className="font-medium text-slate-700">{from}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đến</div>
            <div className="font-medium text-slate-700">{to}</div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="w-full h-full rounded-lg border border-slate-200 overflow-hidden">
            <MiniMap latA={latA} lngA={lngA} latB={latB} lngB={lngB} />
          </div>
        </div>
      </div>

      <div className={`mt-3 pt-3 flex items-center justify-between ${
        highlight ? "border-t border-amber-200" : "border-t border-slate-100"
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold text-xs">
            {initials}
          </div>
          <div className="font-medium text-sm">{name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Chi tiết</button>
        </div>
      </div>
    </article>
  );
}
