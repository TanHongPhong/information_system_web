import { useEffect } from "react";
import feather from "feather-icons";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { icon: "home", title: "Trang chủ", to: "/" },
  {
    icon: "list",
    title: "Danh sách công ty vận tải",
    to: "/transport-companies",
  },
  { icon: "map", title: "Theo dõi vị trí", to: "/order-tracking" },
  { icon: "file-text", title: "Lịch sử giao dịch", to: "/payment-history" },
  { icon: "bell", title: "Thông báo", to: "/notifications", dot: true },
  { icon: "user", title: "Người dùng", to: "/profile" },
  { icon: "settings", title: "Cài đặt", to: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    feather.replace();
  }, [pathname]);

  return (
    <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
      <div className="mt-1 mb-1 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
          <i data-feather="shield" className="w-6 h-6" />
        </span>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">
          Trường đẹp trai
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {items.map(({ icon, title, to, dot }) => {
          const active =
            pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <button
              key={to}
              className={`relative w-10 h-10 rounded-xl grid place-items-center transition
                ${
                  active
                    ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              title={title}
              onClick={() => navigate(to)}
              aria-label={title}
            >
              <i data-feather={icon} />
              {dot && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
