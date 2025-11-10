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
  const [sortKey, setSortKey] = useState("recommended");
  const [activeRoute, setActiveRoute] = useState(null);

  const [recent, setRecent] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Load available regions - chỉ 4 điểm chính
  useEffect(() => {
    // Chỉ sử dụng 4 điểm chính: Hà Nội, Đà Nẵng, Cần Thơ, HCM
    const mainRegions = ['Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'HCM'];
    
    // Set ngay lập tức để hiển thị
    setAvailableRegions(mainRegions);
    
    // Vẫn fetch từ API để kiểm tra, nhưng luôn dùng 4 điểm chính
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await api.get("/transport-companies/available-regions");
        const apiRegions = response.data.regions || [];
        // Luôn dùng 4 điểm chính, không phụ thuộc vào API
        setAvailableRegions(mainRegions);
      } catch (err) {
        console.error("Error fetching regions:", err);
        // Nếu lỗi, vẫn dùng 4 điểm mặc định
        setAvailableRegions(mainRegions);
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Tự động set activeRoute khi có đủ from và to
  useEffect(() => {
    if (from && to && from !== to) {
      const route = { from, to };
      setActiveRoute(prev => {
        // Chỉ set nếu khác với activeRoute hiện tại để tránh loop
        if (!prev || prev.from !== from || prev.to !== to) {
          console.log("📍 CompanyDirectory: Auto-setting activeRoute", route);
          return route;
        }
        return prev;
      });
    } else if ((!from || !to)) {
      // Reset activeRoute nếu thiếu from hoặc to
      setActiveRoute(prev => {
        if (prev) {
          console.log("📍 CompanyDirectory: Resetting activeRoute");
          return null;
        }
        return prev;
      });
    }
  }, [from, to]);

  // Load companies from API với filter theo route
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query params
        // Sử dụng activeRoute nếu có, nếu không thì dùng from/to trực tiếp
        const params = new URLSearchParams();
        if (keyword) params.append("q", keyword);
        
        const originRegion = activeRoute?.from || from || "";
        const destRegion = activeRoute?.to || to || "";
        
        if (originRegion && destRegion) {
          params.append("origin_region", originRegion);
          params.append("destination_region", destRegion);
        }
        
        const query = params.toString();
        console.log("🔍 CompanyDirectory: Fetching companies", {
          activeRoute,
          from,
          to,
          originRegion,
          destRegion,
          params: query
        });
        
        const response = await api.get(`/transport-companies${query ? `?${query}` : ""}`);
        
        // Kiểm tra response data
        if (!response || !response.data) {
          console.error("❌ CompanyDirectory: Invalid response", response);
          throw new Error("Invalid response from server");
        }
        
        // Đảm bảo response.data là array
        const companiesData = Array.isArray(response.data) ? response.data : [];
        console.log(`📦 CompanyDirectory: Received ${companiesData.length} companies from API`);
        
        // Transform API data to match UI format
        let transformedData = companiesData.map((company) => ({
          id: company.company_id,
          name: company.name,
          area: Array.isArray(company.areas) ? company.areas.join(", ") : "Chưa cập nhật",
          areas: Array.isArray(company.areas) ? company.areas : [], // Giữ lại để filter
          cost: company.rates?.[0]?.cost_per_km || 0,
          rating: parseFloat(company.rating) || 0,
          reviews: 0, // TODO: Có thể thêm từ database sau
          stats: { orders12m: 0, ontimeRate: 0, csat: company.rating || 0 },
          sizes: company.rates?.map((r) => r.vehicle_type) || [],
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

        // Nếu chưa chọn tuyến, hiển thị top 10 công ty rating cao nhất
        if (!(activeRoute?.from && activeRoute?.to) && !(originRegion && destRegion)) {
          transformedData = transformedData
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);
        }
        
        setCompanies(transformedData);
        console.log(`✅ CompanyDirectory: Found ${transformedData.length} companies`, {
          companies: transformedData.map(c => ({ 
            id: c.id,
            name: c.name, 
            areas: c.areas,
            cost: c.cost,
            rating: c.rating
          })),
          hasRoute: !!(activeRoute?.from && activeRoute?.to) || !!(originRegion && destRegion)
        });
      } catch (err) {
        console.error("❌ CompanyDirectory: Error fetching companies:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        
        // Set empty array để tránh crash
        setCompanies([]);
        
        // Hiển thị error message chi tiết hơn
        const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách công ty";
        setError(`${errorMessage}. Vui lòng kiểm tra backend server hoặc thử lại sau.`);
      } finally {
        setLoading(false);
        console.log("🏁 CompanyDirectory: Fetch completed, loading = false");
      }
    };

    fetchCompanies();
  }, [activeRoute, from, to, keyword]);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(data)) setRecent(data);
    } catch {}
  }, []);

  const saveRecent = useCallback((route) => {
    const v = {
      from: (route?.from ?? from).trim(),
      to: (route?.to ?? to).trim(),
    };
    if (!(v.from && v.to)) return;
    const deduped = [v, ...recent.filter((x) => x.from !== v.from || x.to !== v.to)].slice(0, 6);
    setRecent(deduped);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
    } catch {}
  }, [from, to, recent]);

  // filtering helpers
  const strip = (s) => (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const filtered = useMemo(() => {
    const activeFrom = activeRoute?.from || from || "";
    const activeTo = activeRoute?.to || to || "";
    const k = strip(keyword);
    
    console.log("🔍 CompanyDirectory: Filtering companies", {
      totalCompanies: companies.length,
      activeFrom,
      activeTo,
      keyword: k,
      activeRoute,
      from,
      to
    });
    
    // Nếu không có companies, trả về mảng rỗng
    if (!companies || companies.length === 0) {
      console.log("⚠️ CompanyDirectory: No companies to filter");
      return [];
    }
    
    const result = companies
      .filter((c) => {
        // QUAN TRỌNG: API đã filter theo route rồi, nên không cần filter lại ở frontend
        // Chỉ filter theo keyword nếu có
        
        // Nếu có chọn điểm đi và điểm đến, API đã filter rồi, chỉ cần kiểm tra keyword
        let areaOK = true;
        
        // Bỏ filter areas ở frontend vì API đã filter rồi
        // Chỉ hiển thị tất cả companies mà API trả về

        // Tìm kiếm keyword
        const kwOK =
          !k ||
          strip(c.name || "").includes(k) ||
          strip(c.area || "").includes(k) ||
          (Array.isArray(c.sizes) && c.sizes.some((x) => strip(x).includes(k)));
        
        const passed = areaOK && kwOK;
        if (!passed) {
          console.log(`   ❌ Filtered out: ${c.name}`, { 
            areaOK, 
            kwOK, 
            keyword: k,
            name: c.name,
            area: c.area,
            sizes: c.sizes
          });
        }
        return passed;
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
    
    console.log(`✅ CompanyDirectory: Filtered to ${result.length} companies`, {
      result: result.map(c => ({ id: c.id, name: c.name, areas: c.areas }))
    });
    return result;
  }, [companies, activeRoute, from, to, sortKey, keyword]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    if (!from || !to) {
      alert("Vui lòng chọn đầy đủ điểm lấy hàng và điểm đến trước khi tìm kiếm.");
      return;
    }

    const route = { from, to };
    saveRecent(route);
    setActiveRoute(route);

    // Lưu vào localStorage để truyền qua các trang
    // QUAN TRỌNG: from = điểm đi (origin_region) = nơi xe phải ở
    //             to = điểm đến (destination_region) = nơi xe sẽ đến
    try {
      localStorage.setItem('selected_route', JSON.stringify({
        origin_region: route.from,
        destination_region: route.to
      }));
      console.log("💾 CompanyDirectory: Saved route to localStorage", {
        origin_region: route.from,
        destination_region: route.to
      });
    } catch (e) {
      console.error("Error saving route to localStorage:", e);
    }
  };

  const useRecent = (r) => { 
    const route = { from: r.from || "", to: r.to || "" };
    setFrom(route.from);
    setTo(route.to);
    setActiveRoute(route);
    saveRecent(route);

    // Lưu vào localStorage khi dùng recent
    try {
      localStorage.setItem('selected_route', JSON.stringify({
        origin_region: route.from,
        destination_region: route.to
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
                <p className="mb-2">Không có kết quả phù hợp.</p>
                <p className="text-sm mb-4">Companies: {companies.length}, Filtered: {filtered.length}</p>
                <p className="text-sm mb-4">ActiveRoute: {activeRoute ? `${activeRoute.from} → ${activeRoute.to}` : 'null'}</p>
                <p className="text-sm mb-4">From: {from || 'empty'}, To: {to || 'empty'}</p>
                <button 
                  onClick={() => {
                    console.log("Debug info:", {
                      companies,
                      filtered,
                      activeRoute,
                      from,
                      to,
                      keyword
                    });
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
                >
                  Debug Info (check console)
                </button>
              </div>
            ) : (
              <>
                {console.log("🎨 CompanyDirectory: Rendering", filtered.length, "companies", {
                  companies: filtered.map(c => c.name),
                  loading,
                  error,
                  companiesLength: companies.length,
                  filteredLength: filtered.length
                })}
                {filtered.map((c) => {
                  if (!c || !c.id) {
                    console.warn("⚠️ CompanyDirectory: Invalid company data", c);
                    return null;
                  }
                  return <CompanyRow key={c.id || c.name} c={c} onView={() => setSelected(c)} />;
                })}
              </>
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
