// SidebarMini.jsx
export function SidebarMini({
  active = "file", // "home" | "map" | "file" | "user" | "settings"
  brandText = "6A",
}) {
  const base =
    "w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50";
  const on = "text-blue-600 bg-blue-50 ring-1 ring-blue-200";
  const softOn = "bg-slate-100 text-slate-700"; // kiểu “đang hover/được chọn nhẹ”

  const is = (k, cls = on) => (active === k ? cls : "");

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      {/* Logo */}
      <div className="mt-1 mb-1 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
          {/* shield */}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </span>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">{brandText}</div>
      </div>

      {/* Nav */}
      <div className="flex flex-col items-center gap-4">
        {/* home */}
        <button className={`${base} ${is("home")}`} title="Home">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
        </button>

        {/* map (soft selected theo ảnh) */}
        <button className={`${base} ${is("map", softOn)}`} title="Map">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
            <path d="M9 3v15M15 6v15" />
          </svg>
        </button>

        {/* file (primary selected viền xanh) */}
        <button className={`${base} ${is("file")}`} title="Transactions">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        </button>

        {/* user */}
        <button className={`${base} ${is("user")}`} title="User">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21a8 8 0 1 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* settings */}
        <button className={`${base} ${is("settings")}`} title="Settings">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.9 1.9 0 0 0 .38 2.09l.05.05a2.4 2.4 0 0 1-3.39 3.39l-.05-.05A1.9 1.9 0 0 0 14 20.6a1.9 1.9 0 0 0-2 .4 1.9 1.9 0 0 0-2-.4 1.9 1.9 0 0 0-2.09.38l-.05.05a2.4 2.4 0 0 1-3.39-3.39l.05-.05A1.9 1.9 0 0 0 3.4 15 1.9 1.9 0 0 0 3 14a1.9 1.9 0 0 0 .4-2 1.9 1.9 0 0 0-.4-2 1.9 1.9 0 0 0 .4-2 1.9 1.9 0 0 0 .38-2.09l-.05-.05A2.4 2.4 0 0 1 6.12 2.38l.05.05A1.9 1.9 0 0 0 8.2 2.8 1.9 1.9 0 0 0 10 2.4a1.9 1.9 0 0 0 2-.4 1.9 1.9 0 0 0 2 .4 1.9 1.9 0 0 0 2.09-.38l.05-.05a2.4 2.4 0 0 1 3.39 3.39l-.05.05A1.9 1.9 0 0 0 20.6 8a1.9 1.9 0 0 0 .4 2 1.9 1.9 0 0 0-.4 2 1.9 1.9 0 0 0 .4 2Z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
