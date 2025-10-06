import React from "react";

export default function FilterBtn({ value, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(value)}
      className={
        "flt px-3 py-1.5 text-sm rounded-full ring-1 ring-slate-200 " +
        (active ? "bg-slate-900 text-white" : "hover:bg-slate-50")
      }
      data-filter={value}
    >
      {label}
    </button>
  );
}
