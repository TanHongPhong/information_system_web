// TransportCompanies.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import feather from "feather-icons";

export default function TransportCompanies() {
  // ===== DATA (mock) =====
  const COMPANIES = useMemo(
    () => [
      {
        name: "Công ty Gemadept",
        area: "Toàn quốc",
        cost: 200000,
        rating: 4.7,
        reviews: 1248,
        stats: { orders12m: 3482, ontimeRate: 97.2, csat: 4.8 },
        sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
        services: { cold: true, danger: false, loading: true, insurance: true },
        address: "2 Hải Phòng, Q.1, TP.HCM",
        phone: "028 1234 5678",
      },
      {
        name: "Công ty CP Transimex",
        area: "Nội thành HCM, Liên tỉnh",
        cost: 170000,
        rating: 4.4,
        reviews: 689,
        stats: { orders12m: 2214, ontimeRate: 95.5, csat: 4.5 },
        sizes: ["≤ 2 tấn", "≤ 4 tấn", "Xe lạnh"],
        services: { cold: true, danger: true, loading: false, insurance: true },
        address: "36 Tân Thuận, Quận 7, TP.HCM",
        phone: "028 3777 8888",
      },
      {
        name: "Công ty CP vận tải dầu khí Bình Dương",
        area: "Miền Nam, Bắc–Nam",
        cost: 140000,
        rating: 4.2,
        reviews: 312,
        stats: { orders12m: 1210, ontimeRate: 93.1, csat: 4.2 },
        sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
        services: { cold: false, danger: false, loading: true, insurance: false },
        address: "25 QL13, TP. Thủ Dầu Một, Bình Dương",
        phone: "0274 222 3333",
      },
      {
        name: "Công ty giao nhận toàn cầu DHL",
        area: "Toàn quốc",
        cost: 185000,
        rating: 4.6,
        reviews: 998,
        stats: { orders12m: 2890, ontimeRate: 96.3, csat: 4.6 },
        sizes: ["≤ 2 tấn", "≤ 4 tấn"],
        services: { cold: false, danger: true, loading: false, insurance: true },
        address: "86 Mai Chí Thọ, TP. Thủ Đức, TP.HCM",
        phone: "1900 545 548",
      },
    ],
    []
  );

  // ===== STATE =====
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("recommended");
  const [advOpen, setAdvOpen] = useState(false);

  // Advanced filters
  const [svcCold, setSvcCold] = useState(false);
  const [svcDanger, setSvcDanger] = useState(false);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcInsurance, setSvcInsurance] = useState(false);
  const [pickupTime, setPickupTime] = useState("");
  const [cargoType, setCargoType] = useState("");

  // Modal
  const [selected, setSelected] = useState(null); // company object or null
  const modalOpen = !!selected;

  // Recent routes
  const RECENT_KEY = "recent-routes-v1";
  const [recent, setRecent] = useState([]);

  // ===== HELPERS =====
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

  const Stars = ({ rating }) => {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    return (
      <span className="inline-flex items-center gap-1" title={`${rating.toFixed(1)}/5`}>
        <span className="stars align-[-2px]" aria-hidden="true">
          <span className="stars-fill" style={{ width: `${pct}%` }} />
        </span>
        <span className="text-xs font-bold text-slate-900">({rating.toFixed(1)})</span>
      </span>
    );
  };

  const Icon = ({ name, className = "w-4 h-4" }) => <i data-feather={name} className={className} />;

  // ===== FILTER + SORT (auto-update on change, like original) =====
  const list = useMemo(() => {
    const f = strip(from);
    const t = strip(to);
    const s = strip(size);
    const term = `${f} ${t}`.trim();

    const matchAdvanced = (c) => {
      if (svcCold && !c.services.cold) return false;
      if (svcDanger && !c.services.danger) return false;
      if (svcLoading && !c.services.loading) return false;
      if (svcInsurance && !c.services.insurance) return false;
      if (cargoType === "Lạnh" && !c.services.cold) return false;
      if (cargoType === "Nguy hiểm" && !c.services.danger) return false;
      return true;
    };

    let arr = COMPANIES.filter((c) => {
      const area = strip(c.area);
      const areaOK =
        area.includes("toan quoc") ||
        (term &&
          (area.includes("mien") ||
            area.includes("lien tinh") ||
            (area.includes("noi thanh hcm") &&
              (term.includes("hcm") || term.includes("ho chi minh") || term.includes("sai gon"))))) ||
        !term;

      const sizeOK = !s || c.sizes.some((x) => strip(x).includes(s));
      return areaOK && sizeOK && matchAdvanced(c);
    });

    switch (sort) {
      case "priceAsc":
        arr.sort((a, b) => a.cost - b.cost);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.cost - a.cost);
        break;
      case "ratingDesc":
        arr.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // recommended
        arr.sort((a, b) => b.rating * 1000 - b.cost - (a.rating * 1000 - a.cost));
    }
    return arr;
  }, [
    COMPANIES,
    from,
    to,
    size,
    sort,
    svcCold,
    svcDanger,
    svcLoading,
    svcInsurance,
    cargoType,
  ]);

  // ===== FEATHER ICONS =====
  useEffect(() => {
    feather.replace({ width: 21, height: 21 }); // initial (sidebar/header)
  }, []);
  useEffect(() => {
    feather.replace(); // update icons after list or modal/adv changes
  }, [list, modalOpen, advOpen]);

  // ===== RECENT ROUTES =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);
  const saveRecent = useCallback(
    (src, dst) => {
      const v = { from: (src || "").trim(), to: (dst || "").trim() };
      if (!(v.from || v.to)) return;
      const next = [v, ...recent.filter((x) => x.from !== v.from || x.to !== v.to)].slice(0, 6);
      setRecent(next);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
    },
    [recent]
  );

  // ===== EVENTS =====
  const onSearchClick = () => {
    saveRecent(from, to);
    // list already reacts automatically via useMemo
  };
  const swapFromTo = () => {
    setFrom((prev) => {
      const newFrom = to;
      setTo(prev);
      return newFrom;
    });
  };
  const onEnter = (e) => {
    if (e.key === "Enter") onSearchClick();
  };

  // Modal control
  const openModal = (company) => setSelected(company);
  const closeModal = () => setSelected(null);

  // Lock scroll when modal open + Esc to close
  useEffect(() => {
    if (modalOpen) {
      document.documentElement.classList.add("overflow-hidden");
      const onKey = (e) => e.key === "Escape" && closeModal();
      window.addEventListener("keydown", onKey);
      return () => {
        document.documentElement.classList.remove("overflow-hidden");
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [modalOpen]);

  // ===== RENDER =====
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Global styles (stars + focus ring) */}
      <style>{`
        :is(button,a,select,input,details,summary):focus-visible{outline:2px solid #2563eb;outline-offset:2px}
        .stars{--s:18px;position:relative;display:inline-block;width:calc(var(--s)*5);height:var(--s)}
        .stars::before,.stars-fill{content:"";position:absolute;inset:0;background-repeat:repeat-x;background-size:var(--s) var(--s)}
        .stars::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23d1d5db' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E")}
        .stars-fill{overflow:hidden;width:0%;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f59e0b' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E")}
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ">
            <i data-feather="home" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí">
            <i data-feather="map" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch">
            <i data-feather="file-text" />
          </button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <i data-feather="bell" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng">
            <i data-feather="user" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt">
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      <main className="ml-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <i data-feather="filter" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New">
                <i data-feather="plus" className="w-4 h-4" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications">
                <i data-feather="bell" className="w-4 h-4" />
              </button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive">
                <i data-feather="archive" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <i data-feather="chevron-down" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 space-y-8">
          {/* List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-soft">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Danh sách công ty vận tải được đề xuất</h1>
                  <p className="text-blue-600">List of recommended transport companies</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500">Sắp xếp</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200"
                  >
                    <option value="recommended">Phù hợp nhất</option>
                    <option value="priceAsc">Giá ↑</option>
                    <option value="priceDesc">Giá ↓</option>
                    <option value="ratingDesc">Đánh giá ↓</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 p-5 pt-2">
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onKeyDown={onEnter}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
                placeholder="Chọn điểm lấy hàng"
              />
              <button
                onClick={swapFromTo}
                className="size-10 rounded-xl border border-slate-200 grid place-items-center"
                title="Đổi chiều"
              >
                ⇄
              </button>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onKeyDown={onEnter}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
                placeholder="Chọn điểm đến"
              />
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-10 min-w-[180px] px-3 rounded-xl border border-slate-200"
              >
                <option value="">Chọn kích thước</option>
                <option>≤ 2 tấn</option>
                <option>≤ 4 tấn</option>
                <option>Container 20ft</option>
                <option>Container 40ft</option>
                <option>Xe lạnh</option>
              </select>
              <button onClick={onSearchClick} className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                Tìm kiếm
              </button>
              <button
                onClick={() => setAdvOpen((v) => !v)}
                className="h-10 px-3 rounded-xl border border-slate-200"
              >
                Bộ lọc nâng cao
              </button>
            </div>

            {/* Advanced */}
            {advOpen && (
              <div className="px-5 pb-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={svcCold} onChange={(e) => setSvcCold(e.target.checked)} className="size-4" />
                    Xe lạnh
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={svcDanger} onChange={(e) => setSvcDanger(e.target.checked)} className="size-4" />
                    Hàng nguy hiểm
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={svcLoading} onChange={(e) => setSvcLoading(e.target.checked)} className="size-4" />
                    Bốc xếp
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={svcInsurance}
                      onChange={(e) => setSvcInsurance(e.target.checked)}
                      className="size-4"
                    />
                    Bảo hiểm
                  </label>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Thời gian lấy hàng</label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="h-10 w-full px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Loại hàng</label>
                    <select
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="h-10 w-full px-3 rounded-xl border border-slate-200"
                    >
                      <option value="">— Chọn —</option>
                      <option>Lạnh</option>
                      <option>Nguy hiểm</option>
                      <option>Hàng cồng kềnh</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Recent */}
            <div className="px-5 pb-2">
              {recent.length > 0 && <div className="text-sm text-slate-500 mb-1">Tuyến đã tìm:</div>}
              {recent.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recent.map((r, idx) => (
                    <button
                      key={`${r.from}-${r.to}-${idx}`}
                      className="px-3 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-sm"
                      onClick={() => {
                        setFrom(r.from || "");
                        setTo(r.to || "");
                        onSearchClick();
                      }}
                    >
                      {[r.from, r.to].filter(Boolean).join(" → ")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Table */}
            <div className="border-t border-slate-200" role="table" aria-label="Danh sách công ty">
              <div
                className="hidden md:grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 pt-3 pb-2 text-slate-500 font-semibold"
                role="row"
              >
                <div>Transport company</div>
                <div>Service area</div>
                <div className="text-center">Cost</div>
                <div className="text-center">Đánh giá</div>
                <div className="text-center">Information</div>
              </div>

              {/* Rows */}
              <div>
                {list.length === 0 ? (
                  <div className="px-5 py-10 text-center text-slate-500">
                    Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc thử tuyến khác.
                  </div>
                ) : (
                  list.map((c) => {
                    const co2 = Math.round((c.cost / 1000) * 0.8);
                    return (
                      <div
                        key={c.name}
                        className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 py-4 border-t border-slate-200 animate-in"
                      >
                        <div className="font-medium flex items-center gap-2">{c.name}</div>
                        <div className="min-w-0 font-medium truncate">{c.area}</div>
                        <div className="font-medium text-center">
                          {fmtVND(c.cost)}/KM
                          <div className="text-[11px] text-slate-500">
                            ETA: ~{(c.cost / 10000 + 2).toFixed(1)}h • CO₂ ~{co2}g/KM
                          </div>
                        </div>
                        <div className="text-center">
                          <Stars rating={c.rating} />
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            className="h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => openModal(c)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Offers */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700 pl-4">Ưu đãi & Gói dịch vụ</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft animate-in">
                <div className="text-amber-600 font-semibold mb-1">Giảm 10% tuyến HCM ⇆ Đồng Nai</div>
                <p className="text-sm text-slate-600">Áp dụng đơn ≥ 5 chuyến/tháng, thanh toán định kỳ.</p>
              </article>
              <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
                <div className="text-emerald-600 font-semibold mb-1">SLA: Dock-to-Dock ≤ 24h</div>
                <p className="text-sm text-slate-600">Cam kết thời gian, phạt trễ; theo dõi mốc real-time.</p>
              </article>
              <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
                <div className="text-blue-600 font-semibold mb-1">Bảo hiểm hàng hóa tới 500 triệu</div>
                <p className="text-sm text-slate-600">Tuỳ chọn nâng cấp bảo hiểm cho lô hàng giá trị cao.</p>
              </article>
            </div>
          </section>

          {/* Compare */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5">
            <h2 className="text-xl font-bold text-blue-700 mb-4">So sánh nhanh 3 nhà vận tải</h2>
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">Tiêu chí</th>
                    <th>Gemadept</th>
                    <th>Transimex</th>
                    <th>DHL</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:py-3 [&_td]:border-t [&_td]:border-slate-200">
                  <tr>
                    <td>SLA tuyến HCM ⇆ Bình Dương</td>
                    <td>≤ 6h</td>
                    <td>≤ 8h</td>
                    <td>≤ 10h</td>
                  </tr>
                  <tr>
                    <td>Tracking</td>
                    <td>GPS + mốc</td>
                    <td>GPS</td>
                    <td>GPS + ảnh</td>
                  </tr>
                  <tr>
                    <td>Bảo hiểm</td>
                    <td>Tuỳ chọn</td>
                    <td>Mặc định</td>
                    <td>Tuỳ chọn</td>
                  </tr>
                  <tr>
                    <td>Dịch vụ lạnh</td>
                    <td>Có</td>
                    <td>Có</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-[61] w-full h-full grid place-items-center p-4">
            <div
              className="w-full max-w-[960px] lg:max-w-[1040px] bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative">
                <div className="px-5 md:px-6 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://i.pravatar.cc/120?u=company-1"
                      alt="Company avatar"
                      className="w-16 h-16 rounded-2xl ring-2 ring-white object-cover shadow"
                    />
                    <div>
                      <h3 id="modal-title" className="text-xl md:text-2xl font-extrabold leading-none text-slate-900">
                        {selected?.name || "Chi tiết công ty"}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <i data-feather="check-circle" className="w-4 h-4" /> Đã xác minh
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                          <i data-feather="truck" className="w-4 h-4" /> Cross-dock / FTL / LTL
                        </span>
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          <Stars rating={selected?.rating ?? 0} />
                          <span className="text-xs font-semibold">
                            ({(selected?.reviews ?? 0).toLocaleString("vi-VN")} đánh giá)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-9 w-9 grid place-items-center rounded-xl hover:bg-slate-50"
                      onClick={closeModal}
                      aria-label="Đóng"
                      title="Đóng"
                    >
                      <i data-feather="x" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="px-5 md:px-6 py-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs text-slate-500">Đơn hoàn tất (12 tháng)</div>
                      <div className="mt-1 text-lg font-bold">
                        {(selected?.stats?.orders12m ?? "—")?.toLocaleString?.("vi-VN") ??
                          selected?.stats?.orders12m ??
                          "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs text-slate-500">Tỉ lệ đúng hẹn</div>
                      <div className="mt-1 text-lg font-bold text-emerald-600">
                        {selected?.stats?.ontimeRate != null ? `${selected.stats.ontimeRate}%` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs text-slate-500">Điểm phản hồi (CSAT)</div>
                      <div className="mt-1 text-lg font-bold">
                        {selected?.stats?.csat != null ? `${selected.stats.csat}/5` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs text-slate-500">Phạm vi</div>
                      <div className="mt-1 text-lg font-bold">{selected?.area ?? "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 md:p-6 overflow-auto">
                <div className="flex flex-wrap gap-2 text-sm mb-4">
                  {selected?.services?.cold && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Xe lạnh</span>
                  )}
                  {selected?.services?.danger && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Hàng nguy hiểm</span>
                  )}
                  {selected?.services?.loading && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Bốc xếp</span>
                  )}
                  {selected?.services?.insurance && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Bảo hiểm</span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-5 items-start">
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <h4 className="font-semibold mb-2">Giới thiệu</h4>
                      <p className="text-sm text-slate-700">
                        Đơn vị vận tải chuyên tuyến, thế mạnh cold-chain, FMCG, last-mile nội thành. Hỗ trợ API đồng bộ
                        đơn, tracking thời gian thực.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                      <h4 className="font-semibold mb-2">Năng lực</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Phủ tuyến: {selected?.area}</li>
                        <li>Loại xe: {selected?.sizes?.join(", ")}</li>
                        <li>Giá tham chiếu: {fmtVND(selected?.cost ?? 0)}/KM</li>
                        <li>Đánh giá: {selected ? selected.rating.toFixed(1) : "—"}/5</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                      <h4 className="font-semibold mb-2">Điều khoản</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Hủy miễn phí trong 30 phút</li>
                        <li>Phạt trễ theo SLA</li>
                        <li>Hỗ trợ 24/7</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                      <h4 className="font-semibold mb-2">Đánh giá gần đây</h4>
                      <ul className="space-y-3">
                        <li className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Coopmart DC</span>
                            <Stars rating={Math.min(5, (selected?.rating ?? 0))} />
                          </div>
                          <p className="text-slate-600">Đúng giờ, chứng từ đầy đủ, xử lý khiếu nại nhanh.</p>
                        </li>
                        <li className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Big C Miền Đông</span>
                            <Stars rating={Math.min(5, (selected?.rating ?? 0) + 0.1)} />
                          </div>
                          <p className="text-slate-600">Cold-chain ổn định, tài xế chuyên nghiệp.</p>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                      <h4 className="font-semibold mb-2">Liên hệ</h4>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex items-center gap-2">
                          <Icon name="map-pin" />
                          <span>{selected?.address ?? "Đang cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="phone" />
                          {selected?.phone ? (
                            <a
                              href={`tel:${selected.phone.replace(/\s/g, "")}`}
                              className="underline decoration-dotted"
                            >
                              {selected.phone}
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="mail" />
                          <a href="mailto:sales@company.vn" className="underline decoration-dotted">
                            sales@company.vn
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="globe" />
                          <a href="#" className="underline decoration-dotted">
                            company.vn
                          </a>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-white border border-slate-200 p-2">
                          <div className="text-[11px] text-slate-500">SLA</div>
                          <div className="font-semibold">24h</div>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-2">
                          <div className="text-[11px] text-slate-500">Tối đa tải</div>
                          <div className="font-semibold">15T</div>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-2">
                          <div className="text-[11px] text-slate-500">Bảo hiểm</div>
                          <div className="font-semibold">{selected?.services?.insurance ? "Có" : "—"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50">
                          Báo giá nhanh
                        </button>
                        <button className="flex-1 h-9 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Nhắn Zalo</button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-semibold mb-2">Giờ làm việc</h4>
                      <ul className="text-[13px] text-slate-700 space-y-1">
                        <li>Thứ 2–6: 08:00–18:00</li>
                        <li>Thứ 7: 08:00–12:00</li>
                        <li>CN: Hỗ trợ trực hotline</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-semibold mb-2">Tài liệu</h4>
                      <div className="flex flex-col gap-2">
                        <button className="h-9 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2">
                          <i data-feather="file-text" className="w-4 h-4" /> Hồ sơ năng lực.pdf
                        </button>
                        <button className="h-9 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2">
                          <i data-feather="shield" className="w-4 h-4" /> Bảo hiểm hàng hóa.pdf
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500">* Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.</div>
                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 rounded-xl border border-slate-200" onClick={closeModal}>
                    Đóng
                  </button>
                  <button className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Tiếp tục đặt</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
