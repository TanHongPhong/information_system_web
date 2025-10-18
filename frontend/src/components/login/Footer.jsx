// Social icons inline
const IconBase = ({ className = "w-5 h-5", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Facebook = ({ className }) => (
  <IconBase className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></IconBase>
);
const Instagram = ({ className }) => (
  <IconBase className={className}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></IconBase>
);
const Twitter = ({ className }) => (
  <IconBase className={className}><path d="M22 5.8c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.2 1.6-2.1-.7.5-1.6.8-2.5 1A3.7 3.7 0 0 0 12 8a10.6 10.6 0 0 1-7.7-3.9c-.8 1.4-.4 3.2 1 4.1-.6 0-1.2-.2-1.7-.5 0 1.8 1.3 3.3 3 3.7-.6.2-1.2.2-1.8.1.5 1.6 2 2.7 3.7 2.7A7.5 7.5 0 0 1 2 17a10.6 10.6 0 0 0 5.7 1.7c6.8 0 10.6-5.7 10.6-10.6v-.5c.7-.5 1.3-1.1 1.7-1.8z"/></IconBase>
);

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-gradient-to-r from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between text-blue-900">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl text-white font-extrabold flex items-center justify-center shadow-blueglow"
            style={{ background: "linear-gradient(to bottom right,#1d4ed8,#1e3a8a)" }}
          >
            6A
          </div>
          <div className="text-sm">© 2025 6A Logistics</div>
        </div>
        <div className="flex items-center gap-3">
          <Facebook className="w-5 h-5" />
          <Instagram className="w-5 h-5" />
          <Twitter className="w-5 h-5" />
        </div>
      </div>
      <div
        className="h-[3px] w-full animate-[shine_2.2s_linear_infinite]"
        style={{ backgroundImage: "linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa,#f472b6,#f59e0b)", backgroundSize: "200% 100%" }}
      />
    </footer>
  );
}
