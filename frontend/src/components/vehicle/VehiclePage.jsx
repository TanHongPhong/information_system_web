// components/VehiclePage.jsx
import React, { useMemo, useState } from "react";
import Hero from "./Hero";
import FilterBar from "./FilterBar";
import VehicleCard from "./VehicleCard";
import { XCircle } from "lucide-react";

const COMPANY = "Gemadept Logistics";
const ROUTE = "HCM → Hà Nội";

const seed = [
  { id:1, percent:50, depart:"2025-10-17", plate:"51C-123.45", driver:"T. Minh", status:"Sẵn sàng" },
  { id:2, percent:70, depart:"2025-10-20", plate:"51D-678.90", driver:"N. Hòa",  status:"Còn chỗ" },
  { id:3, percent:20, depart:"2025-10-19", plate:"63C-555.88", driver:"Q. Vũ",   status:"Trống nhiều" },
  { id:4, percent:82, depart:"2025-10-18", plate:"15C-456.12", driver:"M. Quân", status:"Gần đầy" },
  { id:5, percent:35, depart:"2025-10-16", plate:"79C-912.34", driver:"Đ. Nam",  status:"Trống" },
  { id:6, percent:58, depart:"2025-10-21", plate:"43C-101.22", driver:"K. Sơn",  status:"Còn chỗ" },
  { id:7, percent:12, depart:"2025-10-15", plate:"61C-222.33", driver:"B. Lộc",  status:"Trống nhiều" },
  { id:8, percent:88, depart:"2025-10-22", plate:"29C-909.10", driver:"P. Hậu",  status:"Gần đầy" },
];

export default function VehiclePage({ keyword }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("depart-asc");
  const [data] = useState(seed);

  const filtered = useMemo(() => {
    const byFilter = data.filter((x) => {
      if (filter === "lt50") return x.percent < 50;
      if (filter === "50-80") return x.percent >= 50 && x.percent <= 80;
      if (filter === "gt80") return x.percent > 80;
      return true;
    });

    // text search theo plate/driver/status
    const k = (keyword || "").trim().toLowerCase();
    const byKeyword = !k
      ? byFilter
      : byFilter.filter(
          (x) =>
            x.plate.toLowerCase().includes(k) ||
            x.driver.toLowerCase().includes(k) ||
            x.status.toLowerCase().includes(k)
        );

    const sorted = [...byKeyword];
    switch (sort) {
      case "load-asc":
        sorted.sort((a, b) => a.percent - b.percent);
        break;
      case "load-desc":
        sorted.sort((a, b) => b.percent - a.percent);
        break;
      case "plate":
        sorted.sort((a, b) => a.plate.localeCompare(b.plate));
        break;
      default:
        sorted.sort((a, b) => a.depart.localeCompare(b.depart)); // depart-asc
    }
    return sorted;
  }, [data, filter, sort, keyword]);

  return (
    <>
      <Hero />
      <FilterBar active={filter} onChange={setFilter} sort={sort} onSort={setSort} />

      <section className="w-full px-4 md:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
          {filtered.map((item) => (
            <VehicleCard key={item.id} company={COMPANY} route={ROUTE} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-red-600 font-semibold ring-1 ring-red-300 hover:bg-red-50 shadow-[0_8px_30px_rgba(2,6,23,.08)] focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <XCircle className="w-5 h-5" /> Hủy yêu cầu
          </a>
          <p className="mt-3 text-sm text-slate-500">
            Không thấy xe phù hợp? Gửi yêu cầu để hệ thống gợi ý hoặc mở thêm chuyến.
          </p>
        </div>
      </section>
    </>
  );
}
