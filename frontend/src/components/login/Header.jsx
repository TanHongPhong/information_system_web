// Truck icon inline
const IconBase = ({ className = "w-5 h-5", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Truck = ({ className }) => (
  <IconBase className={className}>
    <rect x="1" y="7" width="13" height="8" rx="1" />
    <path d="M14 10h3l3 3v2h-6z" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </IconBase>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-blueglow"
            style={{ background: "linear-gradient(to bottom right,#1d4ed8,#1e3a8a)" }}
          >
            6A
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-blue-700 text-xl md:text-2xl">6A Logistics</div>
            <div className="subtitle-soft text-sm md:text-[13px] leading-none">Đặt xe chở hàng nhanh</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium" />

        <div className="flex items-center gap-2">
          <a
            href="homepage.html#booking"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm shadow-soft btn-shine btn-blue"
          >
            <Truck className="w-4 h-4" /> Đặt xe nhanh
          </a>
        </div>
      </div>
      <div
        className="h-[2px] w-full animate-[shine_2.2s_linear_infinite]"
        style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa,#f472b6,#f59e0b)", backgroundSize: "200% 100%" }}
      />
    </header>
  );
}
