import FeatherIcon from "./FeatherIcon";

function OrderCard({ id, weight, route, date, tone }) {
  const tones = {
    sky:   "bg-sky-50 ring-sky-200 text-slate-600 icon:text-sky-600",
    indigo:"bg-indigo-50 ring-indigo-200 text-slate-600 icon:text-indigo-600",
    emerald:"bg-emerald-50 ring-emerald-200 text-slate-600 icon:text-emerald-600",
    amber:"bg-amber-50 ring-amber-200 text-slate-700 icon:text-amber-600",
    rose:"bg-rose-50 ring-rose-200 text-slate-700 icon:text-rose-600",
  };
  const t = tones[tone] || tones.sky;

  return (
    <article className={`rounded-lg p-3 ring-1 ring-inset ${t.split(" icon:")[0]}`}>
      <div className={`flex items-center justify-between text-[11px] ${t.includes("text-slate-700") ? "text-slate-700" : "text-slate-600"}`}>
        <span className="font-medium">{id}</span>
        <FeatherIcon name="more-horizontal" className="w-4 h-4" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-white/60">
          <FeatherIcon
            name="box"
            className={`w-4 h-4 ${t.includes("icon:text") ? t.split("icon:")[1] : ""}`}
          />
        </span>
        <p className="text-xl font-bold text-slate-900 leading-none">{weight}</p>
      </div>
      <p className="mt-2 text-sm text-slate-800">{route}</p>
      <p className={`text-xs ${t.includes("text-slate-700") ? "text-slate-700" : "text-slate-600"}`}>{date}</p>
    </article>
  );
}

export default function OrdersDetail() {
  return (
    <section className="bg-white rounded-xl2 shadow-soft p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Đơn hàng chi tiết trên xe</h2>
        <span className="text-xs text-slate-500">5 đơn</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <OrderCard id="ID:ORDER 0155" weight="88,9 kg" route="Bình Định – Đà Nẵng" date="11/9/2025" tone="sky" />
        <OrderCard id="ID:ORDER 7723" weight="76 kg" route="Bình Định – Đà Nẵng" date="11/9/2025" tone="indigo" />
        <OrderCard id="ID:ORDER 0856" weight="88,9 kg" route="Bình Định – Đà Nẵng" date="11/9/2025" tone="emerald" />
        <OrderCard id="ID:ORDER 6655" weight="96 kg" route="Bình Định – Đà Nẵng" date="11/9/2025" tone="amber" />
        <OrderCard id="ID:ORDER 0152" weight="99 kg" route="Quy Nhơn – Đà Nẵng" date="10/9/2025" tone="rose" />
      </div>
    </section>
  );
}
