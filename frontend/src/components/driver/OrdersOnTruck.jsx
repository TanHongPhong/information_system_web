import React from "react";
import { MoreHorizontalIcon, BoxIcon } from "./FeatherIcons";

const COLOR_STYLES = {
  sky: {
    cardBg: "bg-sky-50",
    ring: "ring-sky-200",
    headerText: "text-slate-600",
    iconColor: "text-sky-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  indigo: {
    cardBg: "bg-indigo-50",
    ring: "ring-indigo-200",
    headerText: "text-slate-600",
    iconColor: "text-indigo-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  emerald: {
    cardBg: "bg-emerald-50",
    ring: "ring-emerald-200",
    headerText: "text-slate-600",
    iconColor: "text-emerald-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-600",
  },
  amber: {
    cardBg: "bg-amber-50",
    ring: "ring-amber-200",
    headerText: "text-slate-700",
    iconColor: "text-amber-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-700",
  },
  rose: {
    cardBg: "bg-rose-50",
    ring: "ring-rose-200",
    headerText: "text-slate-700",
    iconColor: "text-rose-600",
    weightText: "text-slate-900",
    routeText: "text-slate-800",
    dateText: "text-slate-700",
  },
};

function OrderCard({ order }) {
  const style = COLOR_STYLES[order.color] || COLOR_STYLES.sky;

  return (
    <article
      className={`rounded-lg p-3 ${style.cardBg} ring-1 ring-inset ${style.ring}`}
    >
      {/* header */}
      <div
        className={`flex items-center justify-between text-[11px] ${style.headerText}`}
      >
        <span className="font-medium">ID:{order.id}</span>
        <MoreHorizontalIcon className="w-4 h-4" />
      </div>

      {/* weight / icon */}
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-white/60">
          <BoxIcon className={`w-4 h-4 ${style.iconColor}`} />
        </span>
        <p
          className={`text-xl font-bold leading-none ${style.weightText}`}
        >{`${order.weight} kg`}</p>
      </div>

      {/* route + date */}
      <p className={`mt-2 text-sm ${style.routeText}`}>{order.route}</p>
      <p className={`text-xs ${style.dateText}`}>{order.date}</p>
    </article>
  );
}

export default function OrdersOnTruck({ orders = [] }) {
  return (
    <section className="bg-white rounded-[1rem] shadow-[0_12px_40px_rgba(2,6,23,.08)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Đơn hàng chi tiết trên xe
        </h2>
        <span className="text-xs text-slate-500">
          {orders.length} đơn
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </section>
  );
}
