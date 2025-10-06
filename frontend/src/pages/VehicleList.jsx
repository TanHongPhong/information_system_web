// VehiclesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";

export default function VehiclesList() {
  // --------- Static meta (bạn có thể nhận từ props nếu muốn) ----------
  const COMPANY = "Gemadept Logistics";
  const ROUTE = "HCM → Hà Nội";

  // --------- Data demo ----------
  const [data] = useState([
    { id: 1, percent: 50, depart: "2025-10-17", plate: "51C-123.45", driver: "T. Minh", status: "Sẵn sàng" },
    { id: 2, percent: 70, depart: "2025-10-20", plate: "51D-678.90", driver: "N. Hòa", status: "Còn chỗ" },
    { id: 3, percent: 20, depart: "2025-10-19", plate: "63C-555.88", driver: "Q. Vũ", status: "Trống nhiều" },
    { id: 4, percent: 82, depart: "2025-10-18", plate: "15C-456.12", driver: "M. Quân", status: "Gần đầy" },
    { id: 5, percent: 35, depart: "2025-10-16", plate: "79C-912.34", driver: "Đ. Nam", status: "Trống" },
    { id: 6, percent: 58, depart: "2025-10-21", plate: "43C-101.22", driver: "K. Sơn", status: "Còn chỗ" },
    { id: 7, percent: 12, depart: "2025-10-15", plate: "61C-222.33", driver: "B. Lộc", status: "Trống nhiều" },
    { id: 8, percent: 88, depart: "2025-10-22", plate: "29C-909.10", driver: "P. Hậu", status: "Gần đầy" },
  ]);

  // --------- UI state ----------
  const [filter, setFilter] = useState("all"); // 'all' | 'lt50' | '50-80' | 'gt80'
  const [sort, setSort] = useState("depart-asc"); // 'depart-asc' | 'load-asc' | 'load-desc' | 'plate'

  // --------- Helpers ----------
  const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN");

  const tagColor = (p) => {
    if (p < 40)
      return {
        bg: "bg-emerald-50",
        ring: "ring-emerald-100",
        text: "text-emerald-700",
        fill: "linear-gradient(90deg,#22c55e 0%,#86efac 100%)",
      };
    if (p < 80)
      return {
        bg: "bg-yellow-50",
        ring: "ring-yellow-100",
        text: "text-yellow-700",
        fill: "linear-gradient(90deg,#f59e0b 0%,#fde68a 100%)",
      };
    return {
      bg: "bg-rose-50",
      ring: "ring-rose-100",
      text: "text-rose-700",
      fill: "linear-gradient(90deg,#ef4444 0%,#fca5a5 100%)",
    };
  };

  // --------- Derived list (filter + sort) ----------
  const list = useMemo(() => {
    let arr = data.filter((x) => {
      if (filter === "lt50") return x.percent < 50;
      if (filter === "50-80") return x.percent >= 50 && x.percent <= 80;
      if (filter === "gt80") return x.percent > 80;
      return true;
    });

    if (sort === "depart-asc") arr = [...arr].sort((a, b) => a.depart.localeCompare(b.depart));
    if (sort === "load-asc") arr = [...arr].sort((a, b) => a.percent - b.percent);
    if (sort === "load-desc") arr = [...arr].sort((a, b) => b.percent - a.percent);
    if (sort === "plate") arr = [...arr].sort((a, b) => a.plate.localeCompare(b.plate));

    return arr;
  }, [data, filter, sort]);

  // --------- Feather icons ----------
  useEffect(() => {
    // Lần đầu mount
    feather.replace({ width: 21, height: 21 });
  }, []);
  useEffect(() => {
    // Mỗi khi grid thay đổi
    feather.replace(); // giữ kích thước theo class Tailwind w-4 h-4 trên từng icon
  }, [list, filter, sort]);

  // --------- Components ----------
  const Icon = ({ name, cls = "w-4 h-4" }) => <i data-feather={name} className={cls} />;

  const FilterBtn = ({ value, label }) => {
    const active = filter === value;
    return (
      <button
        type="button"
        onClick={() => setFilter(value)}
        className={
          "flt px-3 py-1.5 text-sm rounded-full ring-1 ring-slate-200 " +
          (active ? "bg-slate-900 text-white" : "hover:bg-slate-50")
        }
        data-filter={value}
      >
        {label}
      </button>
    );
  };

  const VehicleCard = ({ item }) => {
    const c = tagColor(item.percent);
    return (
      <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col animate-in">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{COMPANY}</span>
            <span className="text-slate-300">•</span>
            <span>{ROUTE}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md ${c.bg} ${c.text} ring-1 ${c.ring}`}>{item.status}</span>
        </div>

        <div
          className="relative w-full max-w-[700px] mx-auto mt-4 truck-wrap"
          style={{ ["--p"]: String(item.percent / 100) }}
        >
          <img
            src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
            alt="Xe tải"
            className="w-full h-auto select-none"
          />

          <div className="trailer-overlay">
            <div className="trailer-frame">
              <div className="trailer-fill" style={{ background: c.fill }} />
              <div className="percent-display">{item.percent} %</div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-0.5 w-56 mx-auto bg-[#1E66FF]" />

        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Icon name="calendar" />
            <span>
              Khởi hành: <b>{fmtDate(item.depart)}</b>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="hash" />
            <span>
              Biển số: <b>{item.plate}</b>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="user" />
            <span>
              Tài xế: <b>{item.driver}</b>
            </span>
          </li>
        </ul>

        <button
          type="button"
          className="mt-5 self-center rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2"
        >
          Chọn xe
        </button>
      </article>
    );
  };

  // --------- Render ----------
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Styles port từ bản HTML */}
      <style>{`
        body { font-family: Inter, ui-sans-serif, system-ui; }
        .truck-wrap{ --p:.5; --radius:14px; --frame-inset:clamp(6px,3.5%,14px) }
        .trailer-overlay{ position:absolute; left:19%; top:26.2%; width:44%; height:27%; display:grid; place-items:center; overflow:hidden }
        .trailer-frame{ position:absolute; inset:var(--frame-inset); border-radius:var(--radius); overflow:hidden; border:1px solid rgba(255,255,255,.18); background:linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06)); backdrop-filter:blur(1px); box-shadow:0 8px 24px rgba(0,0,0,.24) }
        .trailer-fill{ position:absolute; inset:0; width:calc(var(--p)*100%); border-top-left-radius:var(--radius); border-bottom-left-radius:var(--radius); transition:width .45s cubic-bezier(.22,.61,.36,1) }
        .percent-display{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,.35) }
        #hero .title{ color:#1E66FF; -webkit-text-stroke:1px rgba(255,255,255,.18); text-shadow:0 3px 14px rgba(0,0,0,.85), 0 1px 0 rgba(0,0,0,.35) }
        #hero .hero-bg{ background-image: var(--hero-img); background-size:cover; background-position:center; filter:saturate(1.05) contrast(1.05) }
      `}</style>

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Trang chủ"
          >
            <i data-feather="home" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Theo dõi vị trí"
          >
            <i data-feather="map" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Lịch sử giao dịch"
          >
            <i data-feather="file-text" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Thông báo"
          >
            <i data-feather="bell" className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Người dùng"
          >
            <i data-feather="user" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            title="Cài đặt"
          >
            <i data-feather="settings" className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-20 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-4 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i
                  data-feather="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by route, plate, driver..."
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <i data-feather="filter" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                title="New"
              >
                <i data-feather="plus" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
                title="Notifications"
              >
                <i data-feather="bell" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
                title="Archive"
              >
                <i data-feather="archive" className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <img
                  src="https://i.pravatar.cc/40?img=8"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <i data-feather="chevron-down" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section id="hero" className="relative h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden">
          <style>{`
            #hero{ --hero-img:url('https://png.pngtree.com/background/20220720/original/pngtree-road-photography-in-grassland-scenic-area-picture-image_1688712.jpg'); }
          `}</style>
          <div className="hero-bg absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_60%)]" />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <h1 className="title text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight">
              List of transportation vehicles
            </h1>
            <div className="mt-2 h-[6px] w-40 relative">
              <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/60 rounded-full"></span>
              <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[6px] w-24 bg-[#1E66FF] rounded-full shadow-[0_2px_10px_rgba(30,102,255,0.5)]"></span>
            </div>
            <p className="mt-3 max-w-4xl text-sm sm:text-base text-white/90 leading-relaxed">
              Đây là danh sách các phương tiện sẵn sàng đáp ứng nhu cầu vận chuyển của bạn.
            </p>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="sticky top-[56px] z-40 bg-white/95 backdrop-blur border-y border-slate-200">
          <div className="w-full px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <i data-feather="filter" className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold">Bộ lọc</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterBtn value="all" label="Tất cả" />
              <FilterBtn value="lt50" label="< 50%" />
              <FilterBtn value="50-80" label="50–80%" />
              <FilterBtn value="gt80" label="> 80%" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <i data-feather="sliders" className="w-4 h-4 text-slate-500" />
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-slate-200 bg-white"
              >
                <option value="depart-asc">Sắp xếp: Khởi hành sớm → trễ</option>
                <option value="load-asc">% tải tăng dần</option>
                <option value="load-desc">% tải giảm dần</option>
                <option value="plate">Theo biển số (A→Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="w-full px-4 md:px-6 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
            {list.map((item) => (
              <VehicleCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-red-600 font-semibold ring-1 ring-red-300 hover:bg-red-50 shadow-soft focus:outline-none focus:ring-2 focus:ring-red-200"
              onClick={() => {}}
            >
              <i data-feather="x-circle" className="w-5 h-5" />
              Hủy yêu cầu
            </button>
            <p className="mt-3 text-sm text-slate-500">
              Không thấy xe phù hợp? Gửi yêu cầu để hệ thống gợi ý hoặc mở thêm chuyến.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
