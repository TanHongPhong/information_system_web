import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "./Icons";
import { UserPlus } from "../sign in/Icons";

export default function Header() {
  const progressRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const checkAuthAndNavigate = (path) => {
    const user = localStorage.getItem("gd_user");
    if (user) {
      navigate(path);
    } else {
      alert("Vui lòng đăng nhập để tiếp tục!");
      navigate("/sign-in");
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled(y > 8);
      const h = document.documentElement;
      const ratio = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (progressRef.current) progressRef.current.style.width = (ratio * 100).toFixed(2) + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="siteHeader"
      className={`sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-shadow ${scrolled ? "is-scrolled" : ""}`}
    >
      <div id="progressBar" ref={progressRef} />
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/web_logo.png" alt="6A Logistics" className="h-10 w-auto" />
          <div className="hidden sm:block leading-tight">
            <div className="font-extrabold text-blue-700 text-xl md:text-2xl">6A Logistics</div>
            <div className="subtitle-soft text-sm md:text-[13px] leading-none">Đặt xe chở hàng nhanh</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-[15px] lg:text-[17px] font-medium">
          <a className="px-2.5 py-1.5 rounded-md text-slate-900 link-ux" href="#">Tổng quan</a>
          <a className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-600 link-ux" href="#features">Tính năng</a>
          <a className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-600 link-ux" href="#routes">Tuyến</a>
          <a className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-600 link-ux" href="#pricing">Giá</a>
          <a className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-600 link-ux" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/sign-in")}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-white text-sm shadow-[0_12px_40px_rgba(2,6,23,.08)] btn-shine btn-blue"
          >
            <LogIn className="w-4 h-4" /> Đăng nhập
          </button>
          <button
            onClick={() => navigate("/sign-up")}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/85 border border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700 shadow-[0_12px_40px_rgba(2,6,23,.08)] btn-shine"
          >
            <UserPlus className="w-4 h-4" /> Đăng ký
          </button>
        </div>
      </div>
      <div className="h-[2px] w-full bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa,#f472b6,#f59e0b)] bg-[length:200%_100%] animate-[shine_2.2s_linear_infinite]" />
    </header>
  );
}
