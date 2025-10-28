// src/components/login/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "./Icons";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    // Debug: Kiểm tra role
    console.log("Selected role:", role);
    
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd, role })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("gd_user", JSON.stringify(data.user));
        localStorage.setItem("role", role);
        
        if (remember) {
          localStorage.setItem("remember", "true");
        }
        
        alert("Đăng nhập thành công!");
        
        // Điều hướng theo vai trò
        const map = {
          user: "/transport-companies",
          driver: "/driver",
          transport_company: "/suplier",
          warehouse: "/warehouse",
        };
        
        const targetPath = map[role] || "/dashboard";
        console.log("Navigating to:", targetPath);
        navigate(targetPath);
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
          <p className="subtitle-soft mt-1">Nhập thông tin & chọn đúng vai trò của bạn.</p>
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

        <div className="grid grid-cols-6 gap-3 items-center">
          <div className="col-span-6 sm:col-span-4">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Vai trò đăng nhập
            </label>
            <select
              id="role"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">-- Chọn vai trò --</option>
              <option value="user">Khách hàng</option>
              <option value="driver">Tài xế</option>
              <option value="transport_company">Công ty vận tải</option>
              <option value="warehouse">Nhà kho</option>
            </select>
          </div>
          <label className="col-span-3 sm:col-span-2 mt-7 inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Nhớ tôi
          </label>
        </div>

        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Quên mật khẩu?
          </a>
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
