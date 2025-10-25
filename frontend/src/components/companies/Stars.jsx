import React from "react";

/** Hiển thị 1 ngôi sao */
export function Star({ filled = false, size = 18 }) {
  return (
    <span
      className={`text-lg ${filled ? "text-amber-500" : "text-slate-300"}`}
      style={{ fontSize: size + "px" }}
    >
      ★
    </span>
  );
}

/** Hiển thị 5 sao có phần trăm lấp đầy + số điểm (x.x) */
export default function Stars({ rating, size = 18, showNumber = true }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const styleBox = { width: size * 5, height: size, lineHeight: `${size}px` };
  const styleFill = { width: `${pct}%` };
  const starRow = "★★★★★"; // font mặc định, đồng đều, dễ clip

  return (
    <span
      className="inline-flex items-center gap-1"
      title={`${rating.toFixed(1)}/5`}
    >
      <span
        className="relative inline-block align-[-2px]"
        style={styleBox}
        aria-hidden="true"
      >
        <span className="absolute inset-0 text-slate-300 tracking-[2px] select-none">
          {starRow}
        </span>
        <span
          className="absolute inset-0 overflow-hidden text-amber-500 tracking-[2px] select-none"
          style={styleFill}
        >
          {starRow}
        </span>
      </span>
      {showNumber && (
        <span className="text-xs font-bold text-slate-900">
          ({rating.toFixed(1)})
        </span>
      )}
    </span>
  );
}
