import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeftRight } from "lucide-react";
import Stars from "./Stars";
import CompanyModal from "./CompanyModal";
import api from "../../lib/axios";

const RECENT_KEY = "recent-routes-v1";

export default function CompanyDirectory({ keyword }) {
  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [sortKey, setSortKey] = useState("recommended");

  const [recent, setRecent] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Load available regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await api.get("/transport-companies/available-regions");
        setAvailableRegions(response.data.regions || []);
      } catch (err) {
        console.error("Error fetching regions:", err);
        // Không block nếu lỗi, chỉ log
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Load companies from API với filter theo route
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query params
        // QUAN TRỌNG: from = điểm đi (origin_region), to = điểm đến (destination_region)
        const params = new URLSearchParams();
        if (keyword) params.append("q", keyword);
        if (from) params.append("origin_region", from);      // Điểm đi
        if (to) params.append("destination_region", to);       // Điểm đến
        
        console.log("🔍 CompanyDirectory: Fetching companies", {
          from,      // Điểm đi
          to,        // Điểm đến
          params: params.toString()
        });
        
        const response = await api.get(`/transport-companies?${params.toString()}`);
        
        // Transform API data to match UI format
        const transformedData = response.data.map((company) => ({
          id: company.company_id,
          name: company.name,
          area: Array.isArray(company.areas) ? company.areas.join(", ") : "Chưa cập nhật",
          cost: company.rates?.[0]?.cost_per_km || 0,
          rating: parseFloat(company.rating) || 0,
          reviews: 0, // TODO: Có thể thêm từ database sau
          stats: { orders12m: 0, ontimeRate: 0, csat: company.rating || 0 },
          sizes: company.rates?.map(r => r.vehicle_type) || [],
          services: { 
            cold: company.has_cold || false, 
            danger: company.has_dangerous_goods || false, 
            loading: company.has_loading_dock || false, 
            insurance: company.has_insurance || false 
          },
          address: company.address || "",
          phone: company.phone || "",
          email: company.email || "",
          description: company.description || "",
          status: company.status || "ACTIVE",
        }));
        
        setCompanies(transformedData);
        console.log(`✅ CompanyDirectory: Found ${transformedData.length} companies`);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Không thể tải danh sách công ty. Vui lòng kiểm tra backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [from, to, keyword]); // Tự động fetch lại khi from hoặc to thay đổi

  // Load recent from localStorage
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
        return areaOK && sizeOK && kwOK;
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
  }, [companies, from, to, size, sortKey, keyword]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };
  const handleSearch = () => {
    saveRecent();
    // Lưu vào localStorage để truyền qua các trang
    // QUAN TRỌNG: from = điểm đi (origin_region) = nơi xe phải ở
    //             to = điểm đến (destination_region) = nơi xe sẽ đến
    try {
      localStorage.setItem('selected_route', JSON.stringify({
        origin_region: from,      // Điểm đi = nơi xe phải ở
        destination_region: to    // Điểm đến = nơi xe sẽ đến
      }));
      console.log("💾 CompanyDirectory: Saved route to localStorage", {
        origin_region: from,      // Điểm đi
        destination_region: to    // Điểm đến
      });
    } catch (e) {
      console.error("Error saving route to localStorage:", e);
    }
  };
  const useRecent = (r) => { 
    setFrom(r.from || ""); 
    setTo(r.to || ""); 
    // Lưu vào localStorage khi dùng recent
    try {
      localStorage.setItem('selected_route', JSON.stringify({
        origin_region: r.from || "",
        destination_region: r.to || ""
      }));
    } catch (e) {
      console.error("Error saving route to localStorage:", e);
    }
  };

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
          <select
            value={from}
            onChange={(e) => {
              const value = e.target.value;
              console.log("📍 CompanyDirectory: Chọn điểm đi", value);
              setFrom(value);
              if (value === to) setTo(""); // Reset destination nếu trùng
            }}
            className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
          >
            <option value="">Chọn điểm lấy hàng</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <button
            onClick={handleSwap}
            className="size-10 rounded-xl border border-slate-200 grid place-items-center"
            title="Đổi chiều"
            type="button"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <select
            value={to}
            onChange={(e) => {
              const value = e.target.value;
              console.log("📍 CompanyDirectory: Chọn điểm đến", value);
              setTo(value);
            }}
            className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
            disabled={!from}
          >
            <option value="">{!from ? "Chọn điểm đi trước" : "Chọn điểm đến"}</option>
            {availableRegions
              .filter((region) => region !== from)
              .map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
          </select>
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
        </div>

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
            {loading ? (
              <div className="px-5 py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-slate-500">Đang tải danh sách công ty...</p>
              </div>
            ) : error ? (
              <div className="px-5 py-10 text-center text-red-500">
                <p className="mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500">
                Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc thử tuyến khác.
              </div>
            ) : (
              filtered.map((c) => <CompanyRow key={c.id || c.name} c={c} onView={() => setSelected(c)} />)
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
