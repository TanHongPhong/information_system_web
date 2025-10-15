import React from "react";
import { Truck, Clock, BadgeCheck } from "lucide-react";

export default function StatusIcon({ type }) {
  let box = "border-blue-200 bg-blue-50 text-blue-600";
  let Icon = Truck;
  if (type === "pending") { box = "border-amber-200 bg-amber-50 text-amber-600"; Icon = Clock; }
  if (type === "confirmed") { box = "border-emerald-200 bg-emerald-50 text-emerald-600"; Icon = BadgeCheck; }
  return (
    <span className={`grid place-items-center w-9 h-9 rounded-lg border ${box}`}>
      <Icon size={18} />
    </span>
  );
}
