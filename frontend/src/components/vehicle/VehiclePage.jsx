// components/VehiclePage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import VehicleCard from "./VehicleCard";
import { XCircle } from "lucide-react";
import api from "../../lib/axios";

const normalize = (value) =>
  (value || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export default function VehiclePage({ keyword, companyId, originRegion, destinationRegion, userId }) {
  const [sort, setSort] = useState("depart-asc");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState("Danh sách phương tiện");
  const navigate = useNavigate();

  const normalizedOrigin = normalize(originRegion);

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
        // Khi đặt đơn ban đầu: chỉ gửi origin_region (xe ở vị trí pickup)
        // KHÔNG gửi destination_region để hiển thị TẤT CẢ xe khả dụng ở vị trí đó
        const params = new URLSearchParams();
        if (originRegion) params.append('origin_region', originRegion);
        // Không gửi destination_region khi đặt đơn ban đầu để hiển thị tất cả xe
        // if (destinationRegion) params.append('destination_region', destinationRegion);
        
        const queryString = params.toString();
        const vehiclesRes = await api.get(
          `/transport-companies/${companyId}/vehicles${queryString ? `?${queryString}` : ""}`
        );
        const vehicles = vehiclesRes.data || [];
        
        // Fetch orders cho tất cả vehicles để tính load percent
        const ordersRes = await api.get(`/cargo-orders?company_id=${companyId}`);
        const allOrders = ordersRes.data || [];
        
        // Filter chỉ các status hợp lệ (từ ACCEPTED trở đi) để tính load
        const VALID_STATUSES = ['ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
        const activeOrders = allOrders.filter(order => VALID_STATUSES.includes(order.status));
        
        // Transform API data to match UI format với load percent thực tế
        // Filter bỏ các xe đã di chuyển, đang sử dụng có orders, và đầy hàng
        const transformed = (await Promise.all(vehicles.map(async (v) => {
          // Lọc các xe không ở đúng điểm đi (origin_region)
          // CHỈ filter nếu có originRegion và xe có vehicle_region
          // Nếu không có vehicle_region, vẫn hiển thị để tránh filter quá strict
          if (normalizedOrigin && v.vehicle_region) {
            const vehicleLocations = [
              v.current_location,
              v.vehicle_region,
              v.origin_region,
              v.route_name,
            ]
              .filter(Boolean)
              .map(normalize);

            const isMatch = vehicleLocations.some((loc) => loc.includes(normalizedOrigin));
            if (!isMatch) {
              return null;
            }
          }

          // Tìm tất cả orders thuộc về xe này
          const vehicleOrders = activeOrders.filter(order => 
            order.vehicle_id === v.vehicle_id || order.vehicle_id === Number(v.vehicle_id)
          );
          
          // QUAN TRỌNG: Loại bỏ xe đang bốc hàng hoặc đang vận chuyển
          // (có orders với status LOADING hoặc IN_TRANSIT)
          const hasLoadingOrInTransitOrders = vehicleOrders.some(order => 
            order.status === 'LOADING' || order.status === 'IN_TRANSIT'
          );
          
          if (hasLoadingOrInTransitOrders) {
            return null;
          }
          
          // QUAN TRỌNG: Loại bỏ xe có status IN_USE và có orders active
          // (xe đang sử dụng nhưng đã có đơn hàng được gán)
          if (v.status === 'IN_USE' && vehicleOrders.length > 0) {
            return null;
          }
          
          // Tính tổng weight (kg) của các orders đang active (ACCEPTED, LOADING, IN_TRANSIT)
          const activeWeightKg = vehicleOrders
            .filter(order => ['ACCEPTED', 'LOADING', 'IN_TRANSIT'].includes(order.status))
            .reduce((sum, order) => sum + (Number(order.weight_kg) || 0), 0);
          
          // Chuyển từ kg sang tấn và tính percent
          const capacityTon = v.capacity_ton || 15;
          const totalWeightTon = activeWeightKg / 1000;
          let percent = 0;
          
          if (capacityTon > 0 && totalWeightTon > 0) {
            percent = Math.min((totalWeightTon / capacityTon) * 100, 100);
          }
          
          // QUAN TRỌNG: Loại bỏ xe đầy hàng (>= 95% capacity)
          if (percent >= 95) {
            return null;
          }
          
          // Loại bỏ xe đang bảo trì hoặc không hoạt động
          if (v.status === 'MAINTENANCE' || v.status === 'INACTIVE') {
            return null;
          }
          
          // Chỉ chấp nhận xe AVAILABLE hoặc IN_USE (nếu không có orders)
          if (v.status !== 'AVAILABLE' && (v.status !== 'IN_USE' || vehicleOrders.length > 0)) {
            return null;
          }
          
          return {
            id: v.vehicle_id,
            plate: v.license_plate,
            driver: v.driver_name || "Chưa phân công",
            vehicleType: v.vehicle_type,
            capacity: capacityTon,
            location: v.current_location,
            vehicle_region: v.vehicle_region,
            availability: v.availability,
            route_name: v.route_name,
            company_name: v.company_name,
            status: v.status === 'AVAILABLE' ? 'Sẵn sàng' : 
                   v.status === 'IN_USE' ? 'Đang sử dụng' :
                   v.status === 'MAINTENANCE' ? 'Bảo trì' : 'Không hoạt động',
            percent: Math.round(percent),
            depart: new Date().toISOString().split('T')[0],
            phone: v.driver_phone,
          };
        }))).filter(v => v !== null); // Filter bỏ các xe null
        
        if (!aborted) {
          setData(transformed);
          const firstName = transformed.find(Boolean)?.company_name || vehicles[0]?.company_name;
          setCompanyName(firstName || "Danh sách phương tiện");
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
  }, [companyId, originRegion, destinationRegion]);

  const filtered = useMemo(() => {
    // text search theo plate/driver/status
    const k = (keyword || "").trim().toLowerCase();
    const byKeyword = !k
      ? data
      : data.filter(
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
  }, [data, sort, keyword]);

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

      <section className="w-full px-4 md:px-6 py-8 md:py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">Không có phương tiện nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
              {filtered.map((item) => {
                // Tạo route display từ vị trí hiện tại và điểm đến
                const originDisplay =
                  item.vehicle_region || item.location || originRegion || "Điểm đi chưa xác định";

                const routeDisplay =
                  destinationRegion
                    ? `${originDisplay} → ${destinationRegion}`
                    : item.route_name ||
                      (originRegion ? `${originRegion} → ${destinationRegion || "—"}` : originDisplay);
                
                return (
                  <VehicleCard
                    key={item.id}
                    company={companyName}
                    route={routeDisplay}
                    item={item}
                    onSelect={() => {
                      const params = new URLSearchParams({ companyId: companyId || "", vehicleId: item.id });
                      if (originRegion) params.append('origin_region', originRegion);
                      if (destinationRegion) params.append('destination_region', destinationRegion);
                      if (userId) params.append('userId', userId);
                      navigate(`/cargo-info?${params.toString()}`);
                    }}
                  />
                );
              })}
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
