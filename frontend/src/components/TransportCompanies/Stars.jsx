import React from "react";

export default function Stars({ rating = 0 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="inline-flex items-center gap-1" title={`${Number(rating).toFixed(1)}/5`}>
      <span className="stars align-[-2px]" aria-hidden="true">
        <span className="stars-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-xs font-bold text-slate-900">({Number(rating).toFixed(1)})</span>
    </span>
  );
}
