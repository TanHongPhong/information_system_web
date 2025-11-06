import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";

const Topbar = React.forwardRef(function Topbar(_, ref) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [roleName, setRoleName] = useState("");
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("gd_user");
        const role = localStorage.getItem("role");
        
        if (userData) {
          const userInfo = JSON.parse(userData);
          setUser(userInfo);
          
          // Map role to Vietnamese name
          const roleMap = {
            user: "Khách hàng",
            driver: "Tài xế",
            transport_company: "Công ty vận tải",
            warehouse: "Nhà kho"
          };
          
          setRoleName(roleMap[role] || roleMap[role] || "Người dùng");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    
    loadUser();
    
    // Listen for storage changes to update user info
    const handleStorageChange = () => loadUser();
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // render feather lần đầu & mỗi khi open đổi (để icon trong menu hiện đúng)
  useEffect(() => {
    feather.replace();
  }, [open]);

  // Click ngoài + Esc để đóng
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
    localStorage.removeItem("remember");
    localStorage.removeItem("auth_token");
    alert("Đã đăng xuất!");
    navigate("/sign-in");
    setOpen(false);
  };

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white ml-20"
    >
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        {/* Search */}
        <div className="flex-1 max-w-2xl mr-3 md:mr-6">
          <div className="relative">
            <i
              data-feather="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />
            <input
              className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
              placeholder="Tìm giao dịch, mã đơn, số tiền…"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Filter"
            >
              <i data-feather="filter" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions + User */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50"
            title="New"
          >
            <i data-feather="plus" className="w-4 h-4" />
          </button>
          <button
            className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
            title="Notifications"
          >
            <i data-feather="bell" className="w-4 h-4" />
          </button>
          <button
            className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
            title="Archive"
          >
            <i data-feather="archive" className="w-4 h-4" />
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

            {/* Dropdown menu - Compact design, only logout */}
            <div
              ref={menuRef}
              role="menu"
              aria-label="User menu"
              className={`absolute right-0 top-full mt-2 z-30 w-40 overflow-hidden bg-white border border-slate-200 rounded-full shadow-lg ring-1 ring-black/5 origin-top transition-all duration-200 ease-out ${
                open ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
              style={{ transformOrigin: "top" }}
              onKeyDown={(e) => e.key === "Tab" && setOpen(false)}
            >
              {/* Logout button */}
              <button
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                onClick={handleLogout}
              >
                <i data-feather="log-out" className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
          {/* /User */}
        </div>
      </div>
    </header>
  );
});

export default Topbar;

