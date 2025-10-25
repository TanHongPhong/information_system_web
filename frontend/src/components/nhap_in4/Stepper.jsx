// components/Stepper.jsx
import React from "react";

function Dot() {
  return <span className="mx-3 h-px w-10 bg-slate-200 hidden sm:inline-block" />;
}

const Badge = ({ state, children }) => {
  const cls =
    state === "done"
      ? "border-2 border-blue-700 text-blue-700"
      : state === "active"
      ? "border-2 border-blue-700 text-blue-700"
      : "border-2 border-blue-300 text-blue-400";
  return <span className={`badge inline-grid place-items-center w-6 h-6 rounded-full mr-2 ${cls}`}>{children}</span>;
};

export default function Stepper() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,.08)] border border-slate-200 p-4">
      <ol className="flex items-center w-full justify-center text-sm">
        <li className="flex items-center font-medium text-blue-700">
          <Badge state="done">1</Badge> Chọn xe <Dot />
        </li>
        <li className="flex items-center font-semibold text-blue-700">
          <Badge state="active">2</Badge> Nhập thông tin hàng hóa <Dot />
        </li>
        <li className="flex items-center text-blue-400">
          <Badge state="upcoming">3</Badge> Xác nhận
        </li>
      </ol>
    </div>
  );
}
