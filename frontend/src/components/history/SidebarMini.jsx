// SidebarMini.jsx
import { useNavigate, useLocation } from "react-router-dom";

export function SidebarMini({
  active = "file", // "home" | "map" | "file"
  brandText = "6A logistics",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const base =
    "w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50";
  const on = "text-blue-600 bg-blue-50 ring-1 ring-blue-200";
  const softOn = "bg-slate-100 text-slate-700"; // kiểu "đang hover/được chọn nhẹ"

  const is = (k, cls = on) => (active === k ? cls : "");
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      {/* Logo */}
      <div className="mt-1 mb-1 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm hover:shadow-md transition-shadow"
          title="Dashboard"
        >
          {/* shield */}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </button>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A logistics</div>
      </div>

      {/* Nav */}
      <div className="flex flex-col items-center gap-4">
        {/* home */}
        <button onClick={() => navigate("/home-page")} className={`${base} ${is("home")} ${isActive("/home-page") ? on : ""}`} title="Home">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
        </button>

        {/* map (soft selected theo ảnh) */}
        <button onClick={() => navigate("/order-tracking")} className={`${base} ${is("map", softOn)} ${isActive("/order-tracking") ? on : ""}`} title="Map">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
            <path d="M9 3v15M15 6v15" />
          </svg>
        </button>

        {/* file (primary selected viền xanh) */}
        <button onClick={() => navigate("/payment-history")} className={`${base} ${is("file")} ${isActive("/payment-history") ? on : ""}`} title="Transactions">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
