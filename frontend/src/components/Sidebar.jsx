import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import feather from "feather-icons";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    feather.replace();
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
      <div className="mt-1 mb-1 text-center select-none">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-grid place-items-center w-14 h-14 rounded-xl bg-white ring-1 ring-sky-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          title="Dashboard"
        >
          <img src="/web_logo.png" alt="6A Logistics" className="h-full w-full object-contain p-1" />
        </button>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          6A logistics
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Trang chủ"
        >
          <i data-feather="home" className="w-6 h-6"></i>
        </button>
        <button
          onClick={() => navigate("/transports-management")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/transports-management")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Quản lý xe"
        >
          <i data-feather="truck" className="w-6 h-6"></i>
        </button>
        <button
          onClick={() => navigate("/order-tracking")}
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            isActive("/order-tracking")
              ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
          title="Theo dõi đơn"
        >
          <i data-feather="map" className="w-6 h-6"></i>
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
