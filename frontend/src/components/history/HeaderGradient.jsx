// HeaderGradient.jsx
export function HeaderGradient({
  placeholder = "Tìm giao dịch, mã đơn, số tiền...",
  user = { name: "Harsh Vani", title: "Deportation Manager", avatar: "https://i.pravatar.cc/40?img=8" },
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-l from-blue-900 via-sky-200 to-white">
      <div className="flex items-center justify-between px-4 md:px-5 py-2.5">
        {/* Search */}
        <div className="flex-1 max-w-3xl mr-3 md:mr-6">
          <div className="relative">
            {/* search icon */}
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21 16.65 16.65" />
            </svg>

            <input
              className="w-full h-11 pl-9 pr-24 rounded-2xl bg-white/95 border border-white/70 shadow-[0_0_0_2px_rgba(59,130,246,.08)] focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={placeholder}
            />

            {/* filter button */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
              title="Filter"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9v7l4 2v-9l8-9Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons + user pill */}
        <div className="flex items-center gap-2 md:gap-3">
          <IconButton title="New">
            <PlusIcon />
          </IconButton>
          <IconButton title="Notifications">
            <BellIcon />
          </IconButton>
          <IconButton title="Archive">
            <ArchiveIcon />
          </IconButton>

          {/* user pill */}
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white/95 text-slate-900 ring-1 ring-slate-200 hover:bg-white"
          >
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[13px] font-semibold">{user.name}</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">{user.title}</div>
            </div>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

/* --- small helpers for the header --- */
function IconButton({ title, children }) {
  return (
    <button
      className="h-10 w-10 rounded-xl grid place-items-center bg-white/90 ring-1 ring-blue-200/60 hover:bg-white shadow-sm"
      title={title}
    >
      {children}
    </button>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="4" rx="1" />
      <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M10 12h4" />
    </svg>
  );
}
