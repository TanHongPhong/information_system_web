// src/components/sign up/SignUpForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, UserPlus } from "../sign in/Icons";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu khớp (chỉ để đảm bảo nhập đúng form)
    if (pwd !== confirmPwd) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Kiểm tra điều khoản
    if (!terms) {
      alert("Vui lòng đồng ý với điều khoản và chính sách!");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password: pwd })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("gd_user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        
        alert("Đăng ký thành công!");
        
        // Điều hướng theo vai trò từ database (mặc định là user)
        const map = {
          user: "/transport-companies",
          transport_company: "/suplier"
        };
        
        const targetPath = map[data.user.role] || "/transport-companies";
        console.log("Navigating to:", targetPath);
        navigate(targetPath);
      } else {
        alert(data.error || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="glass rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Tạo tài khoản</h1>
          <p className="subtitle-soft mt-1">
            Đăng ký nhanh để bắt đầu đặt xe / quản lý chuyến.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-white/70 border border-brand-100 text-blue-700 text-sm">
          <Shield className="w-4 h-4" /> An toàn
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="on">
        {/* Tên */}
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            placeholder="Nguyễn Văn A"
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="0901234567"
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email đăng nhập
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Mật khẩu */}
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="new-password"
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

        {/* Nhập lại mật khẩu */}
        <div>
          <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
            Nhập lại mật khẩu
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="confirm_password"
              type={showConfirmPwd ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((s) => !s)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm"
            >
              {showConfirmPwd ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        {/* Điều khoản */}
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
          />
          <span>
            Tôi đồng ý với{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </a>
          </span>
        </label>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-blue-600 hover:underline">
                
          </a>
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold btn-shine btn-blue">
            <UserPlus className="w-4 h-4" /> Tạo tài khoản
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="text-blue-600 font-medium hover:underline"
          >
            Đăng nhập ngay
          </button>
        </div>
      </form>
    </div>
  );
}

