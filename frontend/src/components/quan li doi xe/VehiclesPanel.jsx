import React, { useState, useEffect, useRef, useMemo } from "react";
import api from "../../lib/axios";
import { IconSearch, IconTruck, IconEye } from "../tracking/IconsFeather";

export default function VehiclesPanel({ selectedId, onSelectVehicle }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const scrollContainerRef = useRef(null);
  const vehicleRefs = useRef({});
  const isFirstLoadRef = useRef(true);

  // Lấy company_id từ localStorage
  const getCompanyId = () => {
    try {
      const userData = localStorage.getItem("gd_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.company_id) return user.company_id;
      }
    } catch (error) {
      console.error("Error getting company_id:", error);
    }
    return null;
  };

  // Fetch vehicles từ API
  useEffect(() => {
    const fetchVehicles = async (silent = false) => {
      try {
        // Chỉ hiển thị loading ở lần fetch đầu tiên
        if (isFirstLoadRef.current && !silent) {
          setLoading(true);
        }
        
        const companyId = getCompanyId();
        
        if (!companyId) {
          console.warn("No company_id found");
          setVehicles([]);
          if (isFirstLoadRef.current) setLoading(false);
          return;
        }

        const response = await api.get(`/transport-companies/${companyId}/vehicles`);
        const data = response.data || [];
        setVehicles(data);
        
        // Auto-select first vehicle if none selected (chỉ lần đầu)
        if (isFirstLoadRef.current && data.length > 0 && !selectedId && onSelectVehicle) {
          onSelectVehicle(data[0].vehicle_id);
        }
        
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      } finally {
        // Chỉ set loading false ở lần đầu (trước khi set isFirstLoadRef = false)
        if (isFirstLoadRef.current && !silent) {
          setLoading(false);
        }
        // Set isFirstLoadRef = false sau khi đã xử lý loading
        isFirstLoadRef.current = false;
      }
    };

    // Lần đầu: hiển thị loading
    fetchVehicles(false);
    
    // Refresh mỗi 30 giây: fetch ngầm (silent)
    const interval = setInterval(() => fetchVehicles(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter vehicles với useMemo
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(query)) ||
          (vehicle.driver_name && vehicle.driver_name.toLowerCase().includes(query)) ||
          (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase().includes(query)) ||
          (vehicle.current_location && vehicle.current_location.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Filter by status
      if (statusFilter !== "all") {
        return vehicle.status === statusFilter;
      }

      return true;
    });
  }, [vehicles, searchQuery, statusFilter]);

  // Scroll selected vehicle vào center khi selectedId thay đổi (khi click)
  useEffect(() => {
    if (!selectedId || !scrollContainerRef.current) return;

    const element = vehicleRefs.current[selectedId];
    if (!element) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    const containerCenter = containerRect.top + containerRect.height / 2;
    const elementCenter = elementRect.top + elementRect.height / 2;
    const offset = elementCenter - containerCenter;

    // Smooth scroll vào center khi click
    container.scrollBy({
      top: offset,
      behavior: "smooth",
    });
  }, [selectedId]);

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { text: "Sẵn sàng", color: "bg-green-100 text-green-800 ring-green-200" },
      IN_USE: { text: "Đang sử dụng", color: "bg-blue-100 text-blue-800 ring-blue-200" },
      MAINTENANCE: { text: "Bảo trì", color: "bg-yellow-100 text-yellow-800 ring-yellow-200" },
      INACTIVE: { text: "Không hoạt động", color: "bg-slate-100 text-slate-800 ring-slate-200" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "bg-slate-100 text-slate-800 ring-slate-200" };
    return (
      <span className={`text-[10px] px-[0.45rem] py-[0.15rem] rounded-full font-semibold tracking-wide ring-1 ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Handle vehicle click
  const handleVehicleClick = (vehicleId) => {
    if (onSelectVehicle) {
      onSelectVehicle(vehicleId);
    }
  };

  // Sort vehicles by created_at desc (giữ nguyên thứ tự, không đưa selected lên đầu)
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <section className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
          {/* sticky header trong card */}
          <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-semibold tracking-tight text-[14px]">
                VEHICLES
              </h3>

              <div className="relative flex-1 min-w-[140px]">
                <input
                  className="h-9 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-[16px] h-[16px]" />
              </div>
      </div>

            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "all"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter("AVAILABLE")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "AVAILABLE"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Sẵn sàng
              </button>
              <button
                onClick={() => setStatusFilter("IN_USE")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "IN_USE"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Đang sử dụng
              </button>
              <button
                onClick={() => setStatusFilter("MAINTENANCE")}
                className={`px-2.5 py-1 rounded-full ring-1 ${
                  statusFilter === "MAINTENANCE"
                    ? "ring-blue-300 bg-blue-50 text-blue-700"
                    : "ring-slate-200 bg-white text-slate-700"
                }`}
              >
                Bảo trì
              </button>
            </div>
          </div>

          {/* Scrollable vehicles list */}
          <div
            ref={scrollContainerRef}
            className="mt-3 space-y-3 overflow-auto max-h-[calc(100vh-200px)] pr-1"
            style={{
              scrollbarWidth: "thin",
              scrollBehavior: "smooth",
            }}
          >
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Đang tải...
              </div>
            ) : sortedVehicles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Không tìm thấy xe nào
              </div>
            ) : (
              sortedVehicles.map((vehicle) => {
                const isSelected = vehicle.vehicle_id === selectedId;
                return (
                  <article
                    key={vehicle.vehicle_id}
                    ref={(el) => {
                      if (el) {
                        vehicleRefs.current[vehicle.vehicle_id] = el;
                      } else {
                        delete vehicleRefs.current[vehicle.vehicle_id];
                      }
                    }}
                    onClick={() => handleVehicleClick(vehicle.vehicle_id)}
                    className={`rounded-xl border transition-all ease-out cursor-pointer ${
                      isSelected
                        ? "border-[2px] border-[#2F6FE4] shadow-[0_10px_26px_rgba(47,111,228,.18)] p-4 bg-blue-50/30"
                        : "border-slate-200 bg-white hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] hover:-translate-y-px hover:border-blue-200 p-3"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF] shrink-0">
                          <IconTruck className="w-4 h-4" />
                        </span>

                        <div className="text-sm min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-[14px]">
                              {vehicle.license_plate || "—"}
          </span>
                            {vehicle.status && getStatusBadge(vehicle.status)}
        </div>

                          <div className="text-[11px] text-slate-500 leading-snug">
                            {vehicle.vehicle_type && <div>{vehicle.vehicle_type}</div>}
                            {vehicle.capacity_ton && (
                              <div className="whitespace-nowrap">Tải trọng: {vehicle.capacity_ton} tấn</div>
                            )}
                          </div>
                        </div>
            </div>

                      <button
                        title={isSelected ? "Đang theo dõi" : "Theo dõi"}
                        className={`shrink-0 w-8 h-8 rounded-full grid place-items-center ring-1 transition-all ${
                          isSelected
                            ? "bg-[#1E66FF] text-white ring-blue-500/30"
                            : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-[#1E66FF] hover:text-white hover:ring-blue-500/30"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVehicleClick(vehicle.vehicle_id);
                        }}
                      >
                        <IconEye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded info khi selected */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="space-y-2 text-xs text-slate-600">
                          {vehicle.driver_name && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span>Tài xế: {vehicle.driver_name}</span>
                            </div>
                          )}
                          {vehicle.driver_phone && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              <span>SĐT: {vehicle.driver_phone}</span>
                            </div>
                          )}
                          {vehicle.current_location && (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                              <span>Vị trí: {vehicle.current_location}</span>
                            </div>
                          )}
                        </div>
            </div>
                    )}

                    {/* Collapsed info khi không selected */}
                    {!isSelected && (
                      <div className="mt-2 grid grid-cols-12 gap-2">
                        <div className="col-span-12">
                          <ul className="space-y-1 text-xs text-slate-500 leading-snug">
                            {vehicle.driver_name && (
                              <li className="flex items-start gap-2 truncate">
                                <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                <span className="truncate">Tài xế: {vehicle.driver_name}</span>
                              </li>
                            )}
                            {vehicle.current_location && (
                              <li className="flex items-start gap-2 truncate">
                                <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                <span className="truncate">Vị trí: {vehicle.current_location}</span>
                              </li>
                            )}
                          </ul>
                        </div>
            </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
