// components/MethodsPicker.jsx
import React from "react";

const Btn = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50",
      active ? "ring-2 ring-blue-200 bg-blue-50" : "",
    ].join(" ")}
  >
    {children}
  </button>
);

export default function MethodsPicker({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-semibold mb-2">Phương thức</h3>
      <div className="flex flex-wrap gap-2">
        <Btn active={value === "momo"} onClick={() => onChange?.("momo")}>MoMo</Btn>
        <Btn active={value === "vietqr"} onClick={() => onChange?.("vietqr")}>VietQR</Btn>
        <Btn active={value === "zalo"} onClick={() => onChange?.("zalo")}>ZaloPay</Btn>
      </div>
    </div>
  );
}
