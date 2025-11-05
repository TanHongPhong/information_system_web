import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

export default function Topbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [roleName, setRoleName] = useState("");
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    feather.replace();
  }, [open]);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("gd_user");
        const role = localStorage.getItem("role");
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        
        if (userData) {
          const userInfo = JSON.parse(userData);
          setUser(userInfo);
          
          // Xác định role name
          let displayRole = "";
          if (role === "transport_company" && isAdmin) {
            displayRole = userInfo.company_name 
              ? `Admin - ${userInfo.company_name}` 
              : "Admin Công ty vận tải";
          } else {
            const roleMap = {
              user: "Khách hàng",
              driver: "Tài xế",
              transport_company: "Công ty vận tải",
              warehouse: "Nhà kho"
            };
            displayRole = roleMap[role] || "Người dùng";
          }
          
          setRoleName(displayRole);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    
    loadUser();
    
    // Listen for storage changes
    const handleStorageChange = () => loadUser();
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
    setOpen(false);
  };

  return (
    <header
      className="fixed top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/65 bg-gradient-to-l from-blue-900 via-sky-200 to-white shadow-sm"
      style={{
        marginLeft: "5rem", // 80px = w-20 sidebar
        width: "calc(100% - 5rem)",
      }}
    >
      <div className="px-3 md:px-5 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 max-w-2xl mr-3 md:mr-6">
            <div className="relative">
              <i
                data-feather="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4"
              ></i>
              <input
                className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-slate-800 placeholder-slate-400"
                placeholder="Tìm giao dịch, mã đơn, số tiền…"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                title="Filter"
              >
                <i
                  data-feather="filter"
                  className="w-4 h-4 text-slate-500"
                ></i>
              </button>
            </div>
          </div>

          {/* Actions + user */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50 transition-all"
              title="New"
            >
              <i data-feather="plus" className="w-4 h-4"></i>
            </button>

            <button
              className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50 transition-all"
              title="Notifications"
            >
              <i data-feather="bell" className="w-4 h-4"></i>
            </button>

            <button
              className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50 transition-all"
              title="Archive"
            >
              <i data-feather="archive" className="w-4 h-4"></i>
            </button>

            {/* User button + Dropdown */}
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="relative z-20 group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                <img
                  src="https://i.pravatar.cc/40?img=8"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">{user?.name || "Người dùng"}</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">
                    {roleName || "Vai trò"}
                  </div>
                </div>
                <i
                  data-feather="chevron-down"
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              <div
                ref={menuRef}
                role="menu"
                aria-label="User menu"
                className={`
                  absolute right-0 top-full -mt-5 pt-5 z-0 w-[182px] 
                  overflow-hidden bg-white border border-slate-200 border-t-0 rounded-b-xl
                  shadow-md ring-1 ring-black/5
                  origin-top transition-all duration-200 ease-out
                  ${
                    open
                      ? "opacity-100 scale-y-100"
                      : "opacity-0 scale-y-95 pointer-events-none"
                  }
                `}
                style={{ transformOrigin: "top" }}
                onKeyDown={(e) => e.key === "Tab" && setOpen(false)}
              >
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <i data-feather="log-out" className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
