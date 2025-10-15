import React from "react";

export default function Stepper({ current = 2 }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-4">
      <ol className="stepper flex items-center w-full justify-center text-sm">
        <li className={`font-medium ${current > 1 ? "done" : ""}`}>
          <span className="badge badge-done">1</span>
          Chọn xe
          <span className="mx-3 h-px w-10 bg-slate-200" />
        </li>
        <li className={`font-semibold ${current === 2 ? "active" : ""}`}>
          <span className="badge badge-active">2</span>
          Nhập thông tin hàng hóa
          <span className="mx-3 h-px w-10 bg-slate-200" />
        </li>
        <li className={`${current < 3 ? "upcoming" : "active"}`}>
          <span className={current < 3 ? "badge badge-upcoming" : "badge badge-active"}>3</span>
          Xác nhận
        </li>
      </ol>
    </div>
  );
}
