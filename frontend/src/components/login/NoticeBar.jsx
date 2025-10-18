// SVG icons inline (không cần lib)
const IconBase = ({ className = "w-5 h-5", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Zap = ({ className }) => (
  <IconBase className={className}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></IconBase>
);
const Phone = ({ className }) => (
  <IconBase className={className}><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></IconBase>
);

export default function NoticeBar() {
  return (
    <div className="bg-gradient-to-r from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 border-b border-white/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 border border-white/80 text-blue-700">
            <Zap className="w-3.5 h-3.5" /> Nhanh – Minh bạch – Đúng giờ
          </span>
          <span className="hidden sm:inline subtitle-soft">Ưu đãi 10% cho chuyến liên tỉnh đặt trước 24h</span>
        </div>
        <a href="tel:19001234" className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800">
          <Phone className="w-4 h-4" /> Hotline: <strong>1900 1234</strong>
        </a>
      </div>
      <div
        className="h-[3px] w-full animate-[shine_2.2s_linear_infinite]"
        style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa,#f472b6,#f59e0b)", backgroundSize: "200% 100%" }}
      />
    </div>
  );
}
