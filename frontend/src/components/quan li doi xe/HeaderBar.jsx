import React from "react";

// icon nhỏ dạng feather inline
const IconSearch = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFilter = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* feather "filter" */}
    <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
  </svg>
);

const IconPlus = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconBell = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconArchive = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const IconChevronDown = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function HeaderBar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-to-r from-white via-sky-200 to-blue-700/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
          {/* ô search */}
          <div className="flex-1 max-w-3xl mr-3 md:mr-6">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search by route, plate, driver..."
                className="w-full h-11 pl-10 pr-14 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 ring-1 ring-white/60 shadow-[0_6px_18px_rgba(2,6,23,.06)] focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50"
                title="Filter"
              >
                <IconFilter className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* actions bên phải */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="h-10 w-10 rounded-xl grid place-items-center bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"
              title="New"
            >
              <IconPlus className="w-4 h-4" />
            </button>

            <button
              className="h-10 w-10 rounded-xl grid place-items-center bg-white ring-1 ring-slate-200 hover:bg-slate-50"
              title="Notifications"
            >
              <IconBell className="w-4 h-4 text-slate-800" />
            </button>

            <button
              className="h-10 w-10 rounded-xl grid place-items-center bg-white ring-1 ring-slate-200 hover:bg-slate-50"
              title="Archive"
            >
              <IconArchive className="w-4 h-4 text-slate-800" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <img
                src="https://i.pravatar.cc/40?img=8"
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[13px]" style={{ fontWeight: 400 }}>
                  Công ty CP Transimex
                </div>
                <div
                  className="text-[11px] text-slate-500 -mt-0.5"
                  style={{ fontWeight: 400 }}
                >
                  Transport Company
                </div>
              </div>
              <IconChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
