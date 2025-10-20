import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeftRight } from "lucide-react";
import Stars from "./Stars";
import CompanyModal from "./CompanyModal";

/** Dữ liệu công ty (giữ đúng nội dung bản HTML) */
const companiesSeed = [
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

const RECENT_KEY = "recent-routes-v1";

export default function CompanyDirectory({ keyword }) {
  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [sortKey, setSortKey] = useState("recommended");
  const [showAdv, setShowAdv] = useState(false);
  const [svcCold, setSvcCold] = useState(false);
  const [svcDanger, setSvcDanger] = useState(false);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcInsurance, setSvcInsurance] = useState(false);
  const [cargoType, setCargoType] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const [recent, setRecent] = useState([]);
  const [companies] = useState(companiesSeed);
  const [selected, setSelected] = useState(null);

  // load recent from localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(data)) setRecent(data);
    } catch {}
  }, []);

  const saveRecent = useCallback(() => {
    const v = { from: from.trim(), to: to.trim() };
    if (!(v.from || v.to)) return;
    const deduped = [v, ...recent.filter((x) => x.from !== v.from || x.to !== v.to)].slice(0, 6);
    setRecent(deduped);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
    } catch {}
  }, [from, to, recent]);

  // filtering helpers
  const strip = (s) => (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matchesAdvanced = (c) => {
    if (svcCold && !c.services.cold) return false;
    if (svcDanger && !c.services.danger) return false;
    if (svcLoading && !c.services.loading) return false;
    if (svcInsurance && !c.services.insurance) return false;
    if (cargoType === "Lạnh" && !c.services.cold) return false;
    if (cargoType === "Nguy hiểm" && !c.services.danger) return false;
    return true;
  };

  const filtered = useMemo(() => {
    const f = strip(from), t = strip(to), s = strip(size), k = strip(keyword);
    return companies
      .filter((c) => {
        // khu vực
        const area = strip(c.area);
        const areaOK =
          area.includes("toan quoc") ||
          (!!(f || t) &&
            (area.includes("mien") ||
              area.includes("lien tinh") ||
              (area.includes("noi thanh hcm") &&
                (f.includes("hcm") || f.includes("ho chi minh") || f.includes("sai gon") ||
                 t.includes("hcm") || t.includes("ho chi minh") || t.includes("sai gon"))))) ||
          !(f || t);

        const sizeOK = !s || c.sizes.some((x) => strip(x).includes(s));
        const kwOK =
          !k ||
          strip(c.name).includes(k) ||
          strip(c.area).includes(k) ||
          c.sizes.some((x) => strip(x).includes(k));
        return areaOK && sizeOK && kwOK && matchesAdvanced(c);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "priceAsc":
            return a.cost - b.cost;
          case "priceDesc":
            return b.cost - a.cost;
          case "ratingDesc":
            return b.rating - a.rating;
          default: // recommended
            return b.rating * 1000 - b.cost - (a.rating * 1000 - a.cost);
        }
      });
  }, [companies, from, to, size, sortKey, keyword, svcCold, svcDanger, svcLoading, svcInsurance, cargoType]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };
  const handleSearch = () => saveRecent();
  const useRecent = (r) => { setFrom(r.from || ""); setTo(r.to || ""); };

  return (
    <section className="p-6 space-y-8">
      {/* List card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.08)]">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Danh sách công ty vận tải được đề xuất</h1>
              <p className="text-blue-600">List of recommended transport companies</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">Sắp xếp</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
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
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
            placeholder="Chọn điểm lấy hàng"
          />
          <button
            onClick={handleSwap}
            className="size-10 rounded-xl border border-slate-200 grid place-items-center"
            title="Đổi chiều"
            type="button"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          <button
            onClick={handleSearch}
            className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
          <button
            onClick={() => setShowAdv((s) => !s)}
            className="h-10 px-3 rounded-xl border border-slate-200"
            type="button"
          >
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Advanced */}
        {showAdv && (
          <div className="px-5 pb-4">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={svcCold} onChange={(e) => setSvcCold(e.target.checked)} />
                Xe lạnh
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={svcDanger} onChange={(e) => setSvcDanger(e.target.checked)} />
                Hàng nguy hiểm
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={svcLoading} onChange={(e) => setSvcLoading(e.target.checked)} />
                Bốc xếp
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={svcInsurance} onChange={(e) => setSvcInsurance(e.target.checked)} />
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
                  <option>Khô</option>
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
          {recent.length > 0 && (
            <>
              <div className="text-sm text-slate-500 mb-1">Tuyến đã tìm:</div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r, i) => (
                  <button
                    key={`${r.from}-${r.to}-${i}`}
                    className="px-3 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-sm"
                    onClick={() => useRecent(r)}
                    type="button"
                  >
                    {[r.from, r.to].filter(Boolean).join(" → ")}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Table */}
        <div className="border-t border-slate-200" role="table" aria-label="Danh sách công ty">
          <div
            className="hidden md:grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 pt-3 pb-2 text-slate-500 font-semibold"
            role="row"
          >
            <div>Công ty vận tải</div>
            <div>Khu vực hoạt động</div>
            <div className="text-center">Giá</div>
            <div className="text-center">Đánh giá</div>
            <div className="text-center">Thông tin</div>
          </div>

          <div>
            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500">
                Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc thử tuyến khác.
              </div>
            ) : (
              filtered.map((c) => <CompanyRow key={c.name} c={c} onView={() => setSelected(c)} />)
            )}
          </div>
        </div>
      </div>

      {/* Offers */}
      <OffersSection />

      {/* Compare */}
      <CompareSection />

      {/* Modal */}
      <CompanyModal company={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function CompanyRow({ c, onView }) {
  const co2 = Math.round((c.cost / 1000) * 0.8);
  const eta = (c.cost / 10000 + 2).toFixed(1);

  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 py-4 border-t border-slate-200 animate-[in_.25s_ease-out_both]">
      <div className="font-medium flex items-center gap-2">{c.name}</div>
      <div className="min-w-0 font-medium truncate">{c.area}</div>
      <div className="font-medium text-center">
        {fmtVND(c.cost)}/KM
        <div className="text-[11px] text-slate-500">ETA: ~{eta}h • CO₂ ~{co2}g/KM</div>
      </div>
      <div className="text-center">
        <Stars rating={c.rating} />
      </div>
      <div className="text-center">
        <button
          type="button"
          className="h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          onClick={onView}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

function OffersSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700 pl-4">Ưu đãi & Gói dịch vụ</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgba(15,23,42,.08)] animate-[in_.25s_ease-out_both]">
          <div className="text-amber-600 font-semibold mb-1">Giảm 10% tuyến HCM ⇆ Đồng Nai</div>
          <p className="text-sm text-slate-600">Áp dụng đơn ≥ 5 chuyến/tháng, thanh toán định kỳ.</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgba(15,23,42,.08)]">
          <div className="text-emerald-600 font-semibold mb-1">SLA: Dock-to-Dock ≤ 24h</div>
          <p className="text-sm text-slate-600">Cam kết thời gian, phạt trễ; theo dõi mốc real-time.</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgba(15,23,42,.08)]">
          <div className="text-blue-600 font-semibold mb-1">Bảo hiểm hàng hóa tới 500 triệu</div>
          <p className="text-sm text-slate-600">Tuỳ chọn nâng cấp bảo hiểm cho lô hàng giá trị cao.</p>
        </article>
      </div>
    </section>
  );
}

function CompareSection() {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.08)] p-5">
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
            <tr><td>SLA tuyến HCM ⇆ Bình Dương</td><td>≤ 6h</td><td>≤ 8h</td><td>≤ 10h</td></tr>
            <tr><td>Tracking</td><td>GPS + mốc</td><td>GPS</td><td>GPS + ảnh</td></tr>
            <tr><td>Bảo hiểm</td><td>Tuỳ chọn</td><td>Mặc định</td><td>Tuỳ chọn</td></tr>
            <tr><td>Dịch vụ lạnh</td><td>Có</td><td>Có</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function fmtVND(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(n);
}
