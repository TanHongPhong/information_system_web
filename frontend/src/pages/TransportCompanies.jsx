import React, { useEffect, useRef, useState } from "react";
import feather from "feather-icons";
import { Link } from "react-router-dom";

const companies = [
  {
    name: "Công ty Gemadept",
    serviceArea: "Toàn quốc",
    cost: 200000,
    sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
  },
  {
    name: "Công ty CP vận tải dầu khí Bình Dương",
    serviceArea: "Miền Nam, Bắc–Nam",
    cost: 140000,
    sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
  },
  {
    name: "Công ty CP Transimex",
    serviceArea: "Nội thành HCM, Liên tỉnh",
    cost: 170000,
    sizes: ["≤ 2 tấn", "≤ 4 tấn", "Xe lạnh"],
  },
  {
    name: "Công ty giao nhận toàn cầu DHL",
    serviceArea: "Toàn quốc",
    cost: 185000,
    sizes: ["≤ 2 tấn", "≤ 4 tấn"],
  },
];

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const strip = (s) =>
  (s || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function TransportCompanies() {
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [sizeVal, setSizeVal] = useState("");
  const [filtered, setFiltered] = useState(companies);

  const topbarRef = useRef(null);

  // Tính chiều cao topbar để sticky hero nằm ngay dưới
  useEffect(() => {
    const updateTopbarH = () => {
      const h = topbarRef.current?.offsetHeight ?? 56;
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };
    updateTopbarH();
    window.addEventListener("resize", updateTopbarH);
    return () => window.removeEventListener("resize", updateTopbarH);
  }, []);

  // Feather icons (chạy 1 lần sau mount)
  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  }, []);

  const onSearch = () => {
    const f = strip(fromVal);
    const t = strip(toVal);
    const s = strip(sizeVal);
    const term = `${f} ${t}`.trim();

    const list = companies.filter((c) => {
      const area = strip(c.serviceArea);
      const areaOK =
        area.includes("toan quoc") ||
        (term &&
          (area.includes("mien") ||
            area.includes("lien tinh") ||
            (area.includes("noi thanh hcm") &&
              (term.includes("hcm") ||
                term.includes("ho chi minh") ||
                term.includes("sai gon"))))) ||
        !term;

      const sizeOK = !s || c.sizes.some((x) => strip(x).includes(s));
      return areaOK && sizeOK;
    });

    setFiltered(list);
  };

  const swapPoints = () => {
    setFromVal(toVal);
    setToVal(fromVal);
  };

  const onEnterSearch = (e) => {
    if (e.key === "Enter") onSearch();
  };

  const headerCols =
    "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_140px] gap-4 items-center";

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Trang chủ"
            aria-label="Trang chủ"
            type="button"
          >
            <i data-feather="home" aria-hidden="true"></i>
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Theo dõi vị trí"
            aria-label="Theo dõi vị trí"
            type="button"
          >
            <i data-feather="map" aria-hidden="true"></i>
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Lịch sử giao dịch"
            aria-label="Lịch sử giao dịch"
            type="button"
          >
            <i data-feather="file-text" aria-hidden="true"></i>
          </button>

          <button
            className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Thông báo"
            aria-label="Thông báo"
            type="button"
          >
            <i data-feather="bell" aria-hidden="true"></i>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Người dùng"
            aria-label="Người dùng"
            type="button"
          >
            <i data-feather="user" aria-hidden="true"></i>
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Cài đặt"
            aria-label="Cài đặt"
            type="button"
          >
            <i data-feather="settings" aria-hidden="true"></i>
          </button>
        </div>
      </aside>

      <main className="ml-24">
        {/* Topbar (sticky) */}
        <div
          id="topbar"
          ref={topbarRef}
          className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white/90 backdrop-blur-sm border-b border-slate-200"
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-blue-50 text-slate-900 ring-1 ring-blue-100 shadow-sm hover:bg-blue-100 transition"
          >
            <img
              src="https://i.pravatar.cc/40?img=8"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="font-semibold">Khách hàng A</span>
            <span className="text-slate-300">•</span>
            <i
              data-feather="chevron-down"
              className="w-4 h-4 opacity-80 group-hover:opacity-100"
            />
          </button>
        </div>

        {/* Hero */}
        <section
          id="hero"
          className="relative h-52 sticky z-40"
          style={{ top: "var(--topbar-h, 56px)" }}
        >
          <div className="absolute inset-0 bg-[url('https://png.pngtree.com/background/20250103/original/pngtree-d-rendering-and-illustration-of-container-cargo-ship-and-cargo-plane-picture-image_13280377.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        </section>

        {/* Content */}
        <section className="p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.08)]">
            {/* Header */}
            <div className="p-5">
              <h1 className="text-2xl font-bold">
                Danh sách công ty vận tải được đề xuất
              </h1>
              <p className="text-blue-600">
                List of recommended transport companies
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 p-5 pt-2">
              <input
                id="from"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                onKeyDown={onEnterSearch}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chọn điểm lấy hàng"
              />
              <button
                id="swap"
                type="button"
                onClick={swapPoints}
                className="size-10 rounded-xl border border-slate-200 grid place-items-center"
                aria-label="Đổi điểm đi/đến"
                title="Đổi điểm đi/đến"
              >
                ⇄
              </button>
              <input
                id="to"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                onKeyDown={onEnterSearch}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chọn điểm đến"
              />
              <select
                id="size"
                value={sizeVal}
                onChange={(e) => setSizeVal(e.target.value)}
                className="h-10 min-w-[180px] px-3 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="">Chọn kích thước</option>
                <option>≤ 2 tấn</option>
                <option>≤ 4 tấn</option>
                <option>Container 20ft</option>
                <option>Container 40ft</option>
                <option>Xe lạnh</option>
              </select>
              <button
                id="search"
                type="button"
                onClick={onSearch}
                className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Table */}
            <div
              className="border-t border-slate-200"
              role="table"
              aria-label="Danh sách công ty"
            >
              <div
                className={`hidden md:${headerCols} px-5 pt-3 pb-2 text-slate-500 font-semibold`}
                role="row"
              >
                <div className="min-w-0">Transport company</div>
                <div className="min-w-0">Service area</div>
                <div className="text-center">Cost</div>
                <div className="text-center">Information</div>
              </div>

              {/* Rows */}
              <div>
                {filtered.map((c) => (
                  <div
                    key={c.name}
                    className={`${headerCols} px-5 py-4 border-t border-slate-200`}
                    role="row"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="min-w-0 font-medium truncate">
                      {c.serviceArea}
                    </div>
                    <div className="font-medium text-center">
                      {fmtVND(c.cost)}/KM
                    </div>
                    <div className="text-center">
                      {/* Link SPA sang trang danh sách xe */}
                      <Link
                        to="/vehicle_list"
                        className="inline-flex items-center justify-center h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        aria-label={`Xem đội xe của ${c.name}`}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Trường hợp không có kết quả */}
                {filtered.length === 0 && (
                  <div className="px-5 py-8 text-center text-slate-500">
                    Không tìm thấy kết quả phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
