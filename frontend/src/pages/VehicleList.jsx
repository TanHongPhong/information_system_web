import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import FilterBtn from "./FilterBtn";
import VehicleCard from "./VehicleCard";

export default function VehiclesList() {
  const COMPANY = "Gemadept Logistics";
  const ROUTE = "HCM → Hà Nội";

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

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("depart-asc");

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

  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, []);
  useEffect(() => {
    feather.replace();
  }, [list, filter, sort]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
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

      {/* SIDEBAR, HEADER, HERO giữ nguyên như bản bạn gửi */}

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
            <FilterBtn value="all" label="Tất cả" active={filter === "all"} onClick={setFilter} />
            <FilterBtn value="lt50" label="< 50%" active={filter === "lt50"} onClick={setFilter} />
            <FilterBtn value="50-80" label="50–80%" active={filter === "50-80"} onClick={setFilter} />
            <FilterBtn value="gt80" label="> 80%" active={filter === "gt80"} onClick={setFilter} />
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
            <VehicleCard key={item.id} item={item} company={COMPANY} route={ROUTE} />
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
    </div>
  );
}
