// components/VehiclePage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import FilterBar from "./FilterBar";
import VehicleCard from "./VehicleCard";
import { XCircle } from "lucide-react";
import api from "../../lib/axios";

export default function VehiclePage({ keyword, companyId }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("depart-asc");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState("Danh sách phương tiện");
  const navigate = useNavigate();

  // Fetch vehicles from API if companyId is provided
  useEffect(() => {
    let aborted = false;
    
    async function fetchVehicles() {
      if (!companyId) {
        // No company ID, use mock data
        const mockData = [
          { id:1, percent:50, depart:"2025-10-17", plate:"51C-123.45", driver:"T. Minh", status:"Sẵn sàng" },
          { id:2, percent:70, depart:"2025-10-20", plate:"51D-678.90", driver:"N. Hòa",  status:"Còn chỗ" },
          { id:3, percent:20, depart:"2025-10-19", plate:"63C-555.88", driver:"Q. Vũ",   status:"Trống nhiều" },
        ];
        if (!aborted) {
          setData(mockData);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch vehicles for this company
        const vehiclesRes = await api.get(`/transport-companies/${companyId}/vehicles`);
        const vehicles = vehiclesRes.data || [];
        
        // Transform API data to match UI format
        const transformed = vehicles.map(v => ({
          id: v.vehicle_id,
          plate: v.license_plate,
          driver: v.driver_name || "Chưa phân công",
          vehicleType: v.vehicle_type,
          capacity: v.capacity_ton,
          location: v.current_location,
          status: v.status === 'AVAILABLE' ? 'Sẵn sàng' : 
                 v.status === 'IN_USE' ? 'Đang sử dụng' :
                 v.status === 'MAINTENANCE' ? 'Bảo trì' : 'Không hoạt động',
          percent: v.status === 'AVAILABLE' ? Math.floor(Math.random() * 40) + 10 : 100,
          depart: new Date().toISOString().split('T')[0],
          phone: v.driver_phone,
        }));
        
        if (!aborted) {
          setData(transformed);
          setCompanyName(vehicles[0]?.company_name || "Danh sách phương tiện");
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        if (!aborted) {
          setError("Không thể tải danh sách phương tiện");
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchVehicles();
    return () => { aborted = true; };
  }, [companyId]);

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

  if (loading) {
    return (
      <>
        <Hero title={companyName} description="Đang tải danh sách phương tiện..." />
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Hero title={companyName} description={error} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => navigate("/transport-companies")}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Quay lại danh sách công ty
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero title={companyName} description={`Danh sách đội xe của công ty ${companyName}`} />
      <FilterBar active={filter} onChange={setFilter} sort={sort} onSort={setSort} />

      <section className="w-full px-4 md:px-6 py-8 md:py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">Không có phương tiện nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
              {filtered.map((item) => (
                <VehicleCard
                  key={item.id}
                  company={companyName}
                  route=""
                  item={item}
                  onSelect={() => navigate(`/nhap-in4?companyId=${companyId || ''}&vehicleId=${item.id}`)}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/transport-companies");
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-red-600 font-semibold ring-1 ring-red-300 hover:bg-red-50 shadow-[0_8px_30px_rgba(2,6,23,.08)] focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <XCircle className="w-5 h-5" /> Hủy yêu cầu
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Không thấy xe phù hợp? Gửi yêu cầu để hệ thống gợi ý hoặc mở thêm chuyến.
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
