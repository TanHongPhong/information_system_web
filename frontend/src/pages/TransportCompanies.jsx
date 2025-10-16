import { useEffect, useMemo, useState, useCallback } from "react";
import feather from "feather-icons";
import CompanyList from "../components/companies/CompanyList";
import CompanyModal from "../components/companies/CompanyModal";

const RECENT_KEY = "recent-routes-v1";

// Helpers
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
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Dữ liệu mẫu (giữ ngay trong App để gọn file)
const COMPANIES = [
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
];

export default function App() {
  // ===== Filters =====
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("recommended");
  const [advOpen, setAdvOpen] = useState(false);
  const [svcCold, setSvcCold] = useState(false);
  const [svcDanger, setSvcDanger] = useState(false);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcIns, setSvcIns] = useState(false);
  const [pickupTime, setPickupTime] = useState("");
  const [cargoType, setCargoType] = useState("");

  // ===== Recent routes =====
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
    catch { return []; }
  });

  const saveRecent = useCallback((f, t) => {
    const v = { from: f.trim(), to: t.trim() };
    if (!(v.from || v.to)) return;
    const data = (recent || []).filter(x => x.from !== v.from || x.to !== v.to);
    data.unshift(v);
    if (data.length > 6) data.pop();
    setRecent(data);
    localStorage.setItem(RECENT_KEY, JSON.stringify(data));
  }, [recent]);

  const handleSwap = () => {
    const f = from;
    setFrom(to);
    setTo(f);
  };
  const handleSearchClick = () => saveRecent(from, to);

  // ===== Filter logic =====
  const matchAdvanced = useCallback((c) => {
    if (svcCold && !c.services.cold) return false;
    if (svcDanger && !c.services.danger) return false;
    if (svcLoading && !c.services.loading) return false;
    if (svcIns && !c.services.insurance) return false;
    if (cargoType === "Lạnh" && !c.services.cold) return false;
    if (cargoType === "Nguy hiểm" && !c.services.danger) return false;
    return true;
  }, [svcCold, svcDanger, svcLoading, svcIns, cargoType]);

  const filtered = useMemo(() => {
    const f = strip(from), t = strip(to), s = strip(size);
    const term = `${f} ${t}`.trim();
    let list = COMPANIES.filter((c) => {
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
      case "priceAsc":  list.sort((a, b) => a.cost - b.cost); break;
      case "priceDesc": list.sort((a, b) => b.cost - a.cost); break;
      case "ratingDesc":list.sort((a, b) => b.rating - a.rating); break;
      default:
        list.sort((a, b) => b.rating * 1000 - b.cost - (a.rating * 1000 - a.cost));
    }
    return list;
  }, [from, to, size, sort, matchAdvanced]);

  // ===== Modal =====
  const [selected, setSelected] = useState(null);
  const openModal = (name) => {
    const c = COMPANIES.find((x) => x.name === name);
    if (c) setSelected(c);
  };
  const closeModal = () => setSelected(null);

  // Feather icons
  useEffect(() => { feather.replace(); });

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Sidebar (giữ nguyên) */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Trang chủ">
            <i data-feather="home" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí">
            <i data-feather="map" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch">
            <i data-feather="file-text" />
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
        {/* Header (giữ nguyên) */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Tìm tên công ty, loại hàng..." />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
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
              <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
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
          {/* Khối danh sách + bộ lọc */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-soft">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Danh sách công ty vận tải được đề xuất</h1>
                  <p className="text-blue-600">List of recommended transport companies</p>
                </div>
              </div>
            </div>

            {/* Filters cơ bản */}
            <div className="flex flex-wrap gap-2 p-5 pt-2">
              <input value={from} onChange={(e)=>setFrom(e.target.value)} className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200" placeholder="Chọn điểm lấy hàng" />
              <button onClick={handleSwap} className="size-10 rounded-xl border border-slate-200 grid place-items-center" title="Đổi chiều">⇄</button>
              <input value={to} onChange={(e)=>setTo(e.target.value)} className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200" placeholder="Chọn điểm đến" />
              <select value={size} onChange={(e)=>setSize(e.target.value)} className="h-10 min-w-[180px] px-3 rounded-xl border border-slate-200">
                <option value="">Chọn kích thước</option>
                <option>≤ 2 tấn</option><option>≤ 4 tấn</option>
                <option>Container 20ft</option><option>Container 40ft</option><option>Xe lạnh</option>
              </select>
              <button onClick={handleSearchClick} className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Tìm kiếm</button>
              <button onClick={()=>setAdvOpen(v=>!v)} className="h-10 px-3 rounded-xl border border-slate-200">Bộ lọc nâng cao</button>
            </div>

            {/* Filters nâng cao */}
            <div className={`px-5 pb-4 ${advOpen ? "" : "hidden"}`}>
              <div className="grid md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4" checked={svcCold} onChange={(e)=>setSvcCold(e.target.checked)} />Xe lạnh
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4" checked={svcDanger} onChange={(e)=>setSvcDanger(e.target.checked)} />Hàng nguy hiểm
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4" checked={svcLoading} onChange={(e)=>setSvcLoading(e.target.checked)} />Bốc xếp
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4" checked={svcIns} onChange={(e)=>setSvcIns(e.target.checked)} />Bảo hiểm
                </label>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Thời gian lấy hàng</label>
                  <input type="datetime-local" value={pickupTime} onChange={(e)=>setPickupTime(e.target.value)} className="h-10 w-full px-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Loại hàng</label>
                  <select value={cargoType} onChange={(e)=>setCargoType(e.target.value)} className="h-10 w-full px-3 rounded-xl border border-slate-200">
                    <option value="">— Chọn —</option>
                    <option>Lạnh</option><option>Nguy hiểm</option><option>Khô</option><option>Hàng cồng kềnh</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="px-5 pb-2">
              {recent?.length ? (
                <>
                  <div className="text-sm text-slate-500 mb-1">Tuyến đã tìm:</div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(({from:f,to:t}, i)=>(
                      <button key={i} className="px-3 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-sm"
                        onClick={()=>{ setFrom(f||""); setTo(t||""); }}>
                        {[f,t].filter(Boolean).join(" → ")}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {/* Bảng danh sách (component) */}
            <CompanyList
              list={filtered}
              sort={sort}
              onSortChange={setSort}
              onOpenModal={openModal}
              fmtVND={fmtVND}
            />
          </div>

          {/* Ưu đãi + So sánh (inlined cho gọn) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700 pl-4">Ưu đãi &amp; Gói dịch vụ</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
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

          <section className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5">
            <h2 className="text-xl font-bold text-blue-700 mb-4">So sánh nhanh 3 nhà vận tải</h2>
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr><th className="py-2">Tiêu chí</th><th>Gemadept</th><th>Transimex</th><th>DHL</th></tr>
                </thead>
                <tbody className="[&_td]:py-3 [&_td]:border-t [&_td]:border-slate-200">
                  <tr><td>SLA tuyến HCM ⇆ Bình Dương</td><td>≤ 6h</td><td>≤ 8h</td><td>≤ 10h</td></tr>
                  <tr><td>Tracking</td><td>GPS + mốc</td><td>GPS</td><td>GPS + ảnh</td></tr>
                  <tr><td>Bảo hiểm</td><td>Tuỳ chọn</td><td>Mặc định</td><td>Tuỳ chọn</td></tr>
                  <tr><td>Dịch vụ lạnh</td><td>Có</td><td>Có</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      {/* Modal chi tiết (component) */}
      <CompanyModal company={selected} onClose={closeModal} />
    </div>
  );
}
