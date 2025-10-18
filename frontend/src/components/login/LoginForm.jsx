import { useState } from "react";

/* Icons inline: Lock, LogIn, LinkedIn */
const IconBase = ({ className = "w-5 h-5", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Lock = ({ className }) => (
  <IconBase className={className}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></IconBase>
);
const LogIn = ({ className }) => (
  <IconBase className={className}><path d="M3 4v16"/><path d="M10 17l5-5-5-5"/><path d="M15 12H8"/></IconBase>
);
const LinkedIn = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8" cy="8" r="1.2"/>
    <path d="M7.5 11.5v6"/><path d="M12 17.5v-6"/><path d="M12 13.5c0-2 3-2 3 0v4"/>
  </IconBase>
);

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const payload = { email, role, remember, ts: Date.now() };
    localStorage.setItem("gd_user", JSON.stringify(payload));
    const map = { guest:"homepage.html", driver:"driver.html", business:"business.html", warehouse:"warehouse.html" };
    window.location.href = map[role] || "homepage.html";
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
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
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
            <label htmlFor="role" className="text-sm font-medium text-slate-700">Vai trò đăng nhập</label>
            <select
              id="role"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">-- Chọn vai trò --</option>
              <option value="guest">Khách</option>
              <option value="driver">Tài xế</option>
              <option value="business">Doanh nghiệp</option>
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
          <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold btn-shine btn-blue">
            <LogIn className="w-4 h-4" /> Đăng nhập
          </button>
        </div>

        <div className="relative my-4">
          <div className="h-px bg-slate-200" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs text-slate-500">Hoặc tiếp tục với</span>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 hover:bg-slate-50"
        >
          <img alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
          <span className="text-sm font-medium text-slate-700">Đăng nhập với Google</span>
        </button>

        <button type="button" className="w-full flex items-center justify-center gap-3 rounded-xl py-2.5 btn-shine btn-green">
          <LinkedIn className="w-5 h-5" />
          <span className="text-sm font-semibold">Đăng nhập với LinkedIn</span>
        </button>
      </form>
    </div>
  );
}
