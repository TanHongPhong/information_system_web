import React from "react";

/* CSS nhúng để component tự chạy, không cần style global */
const css = `
.tg-stars{--s:18px;position:relative;display:inline-block;width:calc(var(--s)*5);height:var(--s)}
.tg-stars::before,.tg-stars-fill{content:"";position:absolute;inset:0;background-repeat:repeat-x;background-size:var(--s) var(--s)}
.tg-stars::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23d1d5db' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E")}
.tg-stars-fill{overflow:hidden;width:0%;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f59e0b' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E")}
`;

export default function Stars({ rating = 0, size = 18, className = "" }) {
  const pct = Math.max(0, Math.min(100, (Number(rating) / 5) * 100));
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={`${Number(rating).toFixed(1)}/5`}>
      <style>{css.replace("--s:18px", `--s:${size}px`)}</style>
      <span className="tg-stars align-[-2px]" aria-hidden="true">
        <span className="tg-stars-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-xs font-bold text-slate-900">({Number(rating).toFixed(1)})</span>
    </span>
  );
}
