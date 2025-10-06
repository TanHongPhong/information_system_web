import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";

import Sidebar from "../components/companies/Sidebar";
import CompaniesTable from "../components/companies/CompaniesTable";

export default function TransportCompanies() {
  const companies = useMemo(
    () => [
      { name: "Công ty Gemadept", serviceArea: "Toàn quốc", cost: 200000, sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"] },
      { name: "Công ty CP vận tải dầu khí Bình Dương", serviceArea: "Miền Nam, Bắc–Nam", cost: 140000, sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"] },
      { name: "Công ty CP Transimex", serviceArea: "Nội thành HCM, Liên tỉnh", cost: 170000, sizes: ["≤ 2 tấn", "≤ 4 tấn", "Xe lạnh"] },
      { name: "Công ty giao nhận toàn cầu DHL", serviceArea: "Toàn quốc", cost: 185000, sizes: ["≤ 2 tấn", "≤ 4 tấn"] },
    ],
    []
  );

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [result, setResult] = useState(companies);

  const fmtVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

  const strip = (s) =>
    (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const onSearch = () => {
    const f = strip(from), t = strip(to), s = strip(size);
    const term = `${f} ${t}`.trim();

    const list = companies.filter((c) => {
      const area = strip(c.serviceArea);
      const areaOK =
        area.includes("toan quoc") ||
        (term &&
          (area.includes("mien") ||
            area.includes("lien tinh") ||
            (area.includes("noi thanh hcm") &&
              (term.includes("hcm") || term.includes("ho chi minh") || term.includes("sai gon"))))) ||
        !term;

      const sizeOK = !s || c.sizes.some((x) => strip(x).includes(s));
      return areaOK && sizeOK;
    });

    setResult(list);
  };

  const onSwap = () => {
    setFrom(to);
    setTo(from);
  };

  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />

      <main className="ml-24">
        {/* Topbar (inline) */}
        <div className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white/90 backdrop-blur-sm border-b border-slate-200">
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-blue-50 text-slate-900 ring-1 ring-blue-100 shadow-sm hover:bg-blue-100 transition"
          >
            <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
            <span className="font-semibold">Khách hàng A</span>
            <span className="text-slate-300">•</span>
            <i data-feather="chevron-down" className="w-4 h-4 opacity-80 group-hover:opacity-100" />
          </button>
        </div>

        {/* Hero (inline) */}
        <section id="hero" className="relative h-52 sticky top-14 z-40">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://png.pngtree.com/background/20250103/original/pngtree-d-rendering-and-illustration-of-container-cargo-ship-and-cargo-plane-picture-image_13280377.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        </section>

        {/* Content */}
        <section className="p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.08)]">
            <div className="p-5">
              <h1 className="text-2xl font-bold">Danh sách công ty vận tải được đề xuất</h1>
              <p className="text-blue-600">List of recommended transport companies</p>
            </div>

            {/* Filters (inline để tối giản) */}
            <div className="flex flex-wrap gap-2 p-5 pt-2">
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chọn điểm lấy hàng"
              />
              <button onClick={onSwap} type="button" className="size-10 rounded-xl border border-slate-200 grid place-items-center" aria-label="Đổi điểm" title="Đổi điểm">
                ⇄
              </button>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chọn điểm đến"
              />
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-10 min-w-[180px] px-3 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="">Chọn kích thước</option>
                <option>≤ 2 tấn</option>
                <option>≤ 4 tấn</option>
                <option>Container 20ft</option>
                <option>Container 40ft</option>
                <option>Xe lạnh</option>
              </select>
              <button onClick={onSearch} type="button" className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                Tìm kiếm
              </button>
            </div>

            <CompaniesTable data={result} fmtVND={fmtVND} />
          </div>
        </section>
      </main>
    </div>
  );
}
