import React from "react";

export default function FilterBtn({ value, label, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onClick(value)}
      className={[
        "px-3 py-1.5 text-sm rounded-full ring-1 transition-colors",
        active
          ? "bg-slate-900 text-white ring-slate-200"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
