import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Truck,
  Package,
  Warehouse,
  ClipboardList,
  ArrowLeftCircle,
  Menu,
  LogOut,
  Building2,
  Sun,
  Moon,
} from "lucide-react";

/* ===================== DATA NHÚNG TRONG FILE ===================== */
const DASHBOARD_DATA = {
  title: "Dashboard",
  pagesByRole: {
    transport_company: [
      { name: "Dashboard", path: "/supplier", icon: "Truck" },
      { name: "Theo dõi đội xe", path: "/...chua_co...", icon: "Truck" },
      {
        name: "Theo dõi đơn hàng",
        path: "/order-tracking",
        icon: "ClipboardList",
      },
    ],
    driver: [{ name: "quản lý xe", path: "/...chuaco...", icon: "Truck" }],
    warehouse: [
      {
        name: "Quản lý kho hàng",
        path: "/warehouse",
        icon: "Warehouse",
      },
    ],
    user: [
      { name: "Trang Chủ", path: "/home-page", icon: "Home" },
      { name: "Đăng nhập/ đăng kí", path: "/sign-in", icon: "User" },
      { name: "Danh sách công ty", path: "/transport-companies", icon: "Home" },
      { name: "Chọn xe", path: "/vehicle-list", icon: "Truck" },
      { name: "Nhập thông tin", path: "/nhap-in4", icon: "Building2" },
      { name: "Quét mã QR", path: "/payment-qr", icon: "Package" },
      { name: "Lịch sử thanh toán", path: "/payment-history", icon: "Package" },
      {
        name: "Theo dõi đơn hàng",
        path: "/order-tracking-customer",
        icon: "ClipboardList",
      },
    ],
  },
};
/* ================================================================= */

const ICON_MAP = { Home, Truck, Package, Warehouse, ClipboardList, Building2 };

export default function RoleDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) navigate("/");
    else setRole(storedRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(() => {
    return DASHBOARD_DATA.pagesByRole[role] || [];
  }, [role]);

  const renderIcon = (icon) => {
    if (!icon) return <Home />;
    if (typeof icon === "string") {
      const Cmp = ICON_MAP[icon] || Home;
      return <Cmp />;
    }
    if (typeof icon === "function") {
      const Cmp = icon;
      return <Cmp />;
    }
    return icon; // đã là ReactNode
  };

  return (
    <div className={`${darkMode ? "dark" : ""} transition-colors duration-500`}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1
              className={`text-xl font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              {DASHBOARD_DATA.title}
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {pages.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Không có trang nào cho vai trò: <b>{role || "—"}</b>
              </div>
            ) : (
              pages.map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => item.path && navigate(item.path)}
                  disabled={!item.path}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-200 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {renderIcon(item.icon)}
                  </span>
                  {sidebarOpen && <span>{item.name}</span>}
                </motion.button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
              {sidebarOpen && <span>Đổi giao diện</span>}
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeftCircle className="w-5 h-5 text-gray-400" />
              {sidebarOpen && <span>Chọn vai trò khác</span>}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("role");
                navigate("/");
              }}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              {sidebarOpen && <span className="text-red-500">Đăng xuất</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-full"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Xin chào, {role ? role.toUpperCase() : "Người dùng"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => item.path && navigate(item.path)}
                  className="p-6 rounded-xl bg-indigo-500/10 hover:bg-indigo-600/20 dark:bg-indigo-800/30 dark:hover:bg-indigo-700/40 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="text-indigo-600 dark:text-indigo-400 mb-3">
                    {renderIcon(item.icon)}
                  </div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
