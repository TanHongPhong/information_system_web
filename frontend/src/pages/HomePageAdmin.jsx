import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, UserCog, Truck, Warehouse, Building2 } from "lucide-react";
import { useState } from "react";

export default function HomePageAdmin() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState("");

  const roles = [
    {
      id: "transport_company",
      label: "Transport company",
      icon: <Truck className="w-6 h-6" />,
    },
    {
      id: "warehouse",
      label: "Warehouse",
      icon: <Warehouse className="w-6 h-6" />,
    },
    { id: "driver", label: "Driver", icon: <Truck className="w-6 h-6" /> },
    { id: "user", label: "User", icon: <UserCog className="w-6 h-6" /> },
  ];

  const handleContinue = () => {
    if (!role) return alert("Vui lòng chọn vai trò!");
    localStorage.setItem("role", role);
    navigate("/dashboard");
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800 shadow-md"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Hệ thống Quản lý Chuỗi Cung Ứng
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Vui lòng chọn vai trò để truy cập hệ thống
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {roles.map((r) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center justify-center border-2 rounded-xl p-4 transition-all duration-200
                ${
                  role === r.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-700/30"
                    : "border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-400"
                }`}
              >
                {r.icon}
                <span className="mt-2 font-semibold text-gray-700 dark:text-gray-200">
                  {r.label}
                </span>
              </motion.button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md"
          >
            Tiếp tục
          </button>
        </motion.div>
      </div>
    </div>
  );
}
