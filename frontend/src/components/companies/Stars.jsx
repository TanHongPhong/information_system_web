import React from "react";

/** Hiển thị 5 sao có phần trăm lấp đầy + số điểm (x.x) */
export default function Stars({ rating, size = 18, showNumber = true }) {
  // Convert rating sang number (an toàn với cả string và number)
  const numRating = parseFloat(rating) || 0;
  
  const pct = Math.max(0, Math.min(100, (numRating / 5) * 100));
  const styleBox = { width: size * 5, height: size, lineHeight: `${size}px` };
  const styleFill = { width: `${pct}%` };
  const starRow = "★★★★★"; // font mặc định, đồng đều, dễ clip

  return (
    <span className="inline-flex items-center gap-1" title={`${numRating.toFixed(1)}/5`}>
      <span className="relative inline-block align-[-2px]" style={styleBox} aria-hidden="true">
        <span className="absolute inset-0 text-slate-300 tracking-[2px] select-none">{starRow}</span>
        <span
          className="absolute inset-0 overflow-hidden text-amber-500 tracking-[2px] select-none"
          style={styleFill}
        >
          {starRow}
        </span>
      </span>
      {showNumber && <span className="text-xs font-bold text-slate-900">({numRating.toFixed(1)})</span>}
    </span>
  );
}
