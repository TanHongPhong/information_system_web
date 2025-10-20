// components/Sidebar.jsx
import React from "react";
import { Shield, Home, Map, FileText, User, Settings } from "lucide-react";

export default function Sidebar() {
  const Btn = ({ title, active, children }) => (
    <button
      title={title}
      className={[
        "w-10 h-10 rounded-xl grid place-items-center",
        active
          ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      <div className="mt-1 mb-1 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
          <Shield className="w-6 h-6" />
        </span>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A</div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Btn title="Trang chủ" active><Home /></Btn>
        <Btn title="Theo dõi vị trí"><Map /></Btn>
        <Btn title="Lịch sử giao dịch"><FileText /></Btn>
        <Btn title="Người dùng"><User /></Btn>
        <Btn title="Cài đặt"><Settings /></Btn>
      </div>
    </aside>
  );
}
