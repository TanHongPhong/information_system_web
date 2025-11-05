import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import feather from "feather-icons";

const navigationConfig = {
  user: [
    { path: "/transport-companies", icon: "briefcase", title: "Danh sách công ty" },
    { path: "/payment-history", icon: "file-text", title: "Lịch sử thanh toán" },
    { path: "/order-tracking-customer", icon: "map", title: "Theo dõi đơn hàng" },
  ],
  transport_company: [
    { path: "/suplier", icon: "home", title: "Dashboard" },
    { path: "/transports-management", icon: "truck", title: "Quản lý xe" },
    { path: "/order-tracking", icon: "map", title: "Theo dõi đơn hàng" },
  ],
  warehouse: [
    { path: "/warehouse", icon: "package", title: "Đơn hàng tại kho" },
    { path: "/warehouse-in-out", icon: "move", title: "Nhập kho & Xuất kho" },
  ],
  driver: [
    { path: "/driver", icon: "truck", title: "Dashboard" },
  ],
};

// Helper để check active với sub-routes
const isRouteActive = (currentPath, targetPath) => {
  if (currentPath === targetPath) return true;
  // Check sub-routes (e.g., /warehouse-in-out matches /warehouse-in-out)
  return currentPath.startsWith(targetPath + "/");
};

export default function UnifiedSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    feather.replace();
  }, [location.pathname]);

  const role = localStorage.getItem("role") || "user";
  const navItems = navigationConfig[role] || navigationConfig.user;
  const isActive = (path) => isRouteActive(location.pathname, path);

  const handleLogout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    localStorage.removeItem("auth_token");
    navigate("/sign-in", { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3 z-40">
      {/* Logo */}
      <div className="mt-1 mb-1 text-center select-none">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm hover:shadow-md transition-shadow"
          title="Dashboard"
        >
          <i data-feather="shield"></i>
        </button>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          6A logistics
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex flex-col items-center gap-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-10 h-10 rounded-xl grid place-items-center transition-colors ${
              isActive(item.path)
                ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title={item.title}
          >
            <i data-feather={item.icon} className="w-6 h-6"></i>
          </button>
        ))}
      </div>

      {/* Logout button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl grid place-items-center text-red-600 hover:bg-red-50 ring-1 ring-red-200 hover:ring-red-300 transition-colors"
          title="Đăng xuất"
        >
          <i data-feather="log-out" className="w-6 h-6"></i>
        </button>
      </div>
    </aside>
  );
}

