import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield, Home, Map, FileText,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const Btn = ({ title, active, children, onClick }) => (
    <button
      onClick={onClick}
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

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      <div className="mt-1 mb-1 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-grid place-items-center w-14 h-14 rounded-xl bg-white ring-1 ring-sky-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          title="Dashboard"
        >
          <img src="/web_logo.png" alt="6A Logistics" className="h-full w-full object-contain p-1" />
        </button>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A logistics</div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Btn title="Trang chủ" active={isActive("/transport-companies")} onClick={() => navigate("/transport-companies")}><Home className="w-6 h-6" /></Btn>
        <Btn title="Theo dõi vị trí" active={isActive("/order-tracking")} onClick={() => navigate("/order-tracking")}><Map className="w-6 h-6" /></Btn>
        <Btn title="Lịch sử giao dịch" active={isActive("/payment-history")} onClick={() => navigate("/payment-history")}><FileText className="w-6 h-6" /></Btn>
      </div>
    </aside>
  );
}
