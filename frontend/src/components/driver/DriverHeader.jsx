import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TruckIcon, LogOutIcon, UserIcon, ChevronDownIcon } from "./FeatherIcons";

export default function DriverHeader({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, onLogout]);

  // Load user info từ localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("gd_user");
        const role = localStorage.getItem("role");

        if (!userData || role !== "driver") {
          // Nếu chưa đăng nhập hoặc không phải driver, logout
          handleLogout();
          return;
        }

        const userInfo = JSON.parse(userData);
        setUser(userInfo);
      } catch (error) {
        console.error("Error loading user:", error);
        handleLogout();
      }
    };

    loadUser();

    // Listen for storage changes
    const handleStorageChange = () => loadUser();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleLogout]);

  // Click ngoài + Esc để đóng dropdown
  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-10 shadow-sm">
      <div
        className="relative px-4 pt-[env(safe-area-inset-top)] py-3 flex items-center justify-between text-white"
        style={{
          background:
            "linear-gradient(90deg, #c8efff 0%, #9ccdf7 45%, #759cea 100%)",
          isolation: "isolate",
        }}
      >
        {/* overlay tối dần qua phải */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,.18), rgba(0,0,0,.08) 40%, rgba(0,0,0,0) 65%)",
          }}
        />

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/15 ring-1 ring-inset ring-white/10">
            <TruckIcon className="w-5 h-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]" />
          </div>

          <div>
            <h1 className="text-base font-semibold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,.5)]">
              Trang tài xế
            </h1>
            <p className="text-xs leading-5 text-white/95 mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]">
              {user?.name || "Tài xế"}
            </p>
          </div>
        </div>

        {/* User menu với dropdown */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition ring-1 ring-inset ring-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]" />
              </div>
              {user?.name && (
                <span className="text-sm font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.45)] hidden sm:inline-block max-w-[100px] truncate">
                  {user.name}
                </span>
              )}
              <ChevronDownIcon className={`w-4 h-4 text-white transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown menu */}
          {open && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50"
            >
              {/* User info */}
              {user && (
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
