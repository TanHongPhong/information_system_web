// src/components/login/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "./Icons";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Lưu token và thông tin user vào localStorage
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        localStorage.setItem("gd_user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        if (data.isAdmin) {
          localStorage.setItem("isAdmin", "true");
        }
        
        alert("Đăng nhập thành công!");
        
        // Điều hướng theo vai trò từ database
        // Chỉ admin transport_company mới vào được trang supplier
        if (data.user.role === "transport_company" && data.isAdmin) {
          navigate("/suplier");
        } else {
          const map = {
            user: "/transport-companies",
            driver: "/driver",
            warehouse: "/warehouse",
            transport_company: "/transport-companies",
          };
          
          // Nếu là user thường có role transport_company nhưng không phải admin, không cho vào supplier
          if (data.user.role === "transport_company" && !data.isAdmin) {
            alert("Bạn không có quyền truy cập trang này. Chỉ admin mới có quyền quản lý công ty.");
            navigate("/transport-companies");
          } else {
            const targetPath = map[data.user.role] || "/transport-companies";
            console.log("Navigating to:", targetPath, "for role:", data.user.role);
            
            // Đặc biệt cho warehouse: hiển thị thông báo chào mừng
            if (data.user.role === "warehouse") {
              console.log("✅ Warehouse user logged in:", data.user.email);
            }
            
            navigate(targetPath);
          }
        }
      } else {
        alert(data.error || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="glass rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Đăng nhập</h1>
          <p className="subtitle-soft mt-1">Nhập thông tin đăng nhập của bạn.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-white/70 border border-blue-100 text-blue-700 text-sm">
          <Lock className="w-4 h-4" /> Bảo mật
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="on">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email hoặc Tên đăng nhập
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm"
            >
              {showPwd ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold btn-shine btn-blue">
            <LogIn className="w-4 h-4" /> Đăng nhập
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-up")}
            className="text-blue-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </form>
    </div>
  );
}
