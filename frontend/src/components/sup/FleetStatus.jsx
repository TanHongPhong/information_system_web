import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";

export default function FleetStatus() {
  const donutRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy company_id từ localStorage hoặc dùng giá trị mặc định
  const getCompanyId = () => {
    try {
      const userData = localStorage.getItem("gd_user");
      if (userData) {
        const user = JSON.parse(userData);
        // Nếu user có company_id, dùng nó
        if (user.company_id) return user.company_id;
      }
    } catch (error) {
      console.error("Error getting company_id:", error);
    }
    // Fallback: lấy company_id đầu tiên (có thể cần thay đổi logic này)
    return 1; // Default company_id
  };

  // Fetch vehicles từ API
  const fetchVehicles = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      const companyId = getCompanyId();
      const response = await fetch(
        `http://localhost:5001/api/transport-companies/${companyId}/vehicles`
      );

      if (response.ok) {
        const data = await response.json();
        setVehicles(data || []);
      } else {
        console.error("Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    
    // Refresh mỗi 10 giây để cập nhật dữ liệu mới (ngầm)
    const interval = setInterval(() => fetchVehicles(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Tính toán số lượng xe theo status
  const getStatusCount = (status) => {
    return vehicles.filter((v) => v.status === status).length;
  };

  const statusData = {
    AVAILABLE: getStatusCount("AVAILABLE"),
    IN_USE: getStatusCount("IN_USE"),
    MAINTENANCE: getStatusCount("MAINTENANCE"),
    OFFLINE: getStatusCount("OFFLINE"),
  };

  const totalVehicles = vehicles.length;

  // Cập nhật chart khi có dữ liệu
  useEffect(() => {
    if (!donutRef.current || loading) return;

    const ctx = donutRef.current.getContext("2d");

    // Tính toán lại status data
    const inUse = vehicles.filter((v) => v.status === "IN_USE").length;
    const available = vehicles.filter((v) => v.status === "AVAILABLE").length;
    const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;
    const offline = vehicles.filter((v) => v.status === "OFFLINE").length;

    // Destroy chart cũ nếu có
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Đang sử dụng",
          "Sẵn sàng",
          "Bảo trì",
          "Offline",
        ],
        datasets: [
          {
            data: [inUse, available, maintenance, offline],
            backgroundColor: [
              "#0b2875", // Đang sử dụng - xanh đậm
              "#2563eb", // Sẵn sàng - xanh dương
              "#d97706", // Bảo trì - cam
              "#ef4444", // Offline - đỏ
            ],
            borderColor: "#fff",
            borderWidth: 6,
            spacing: 2,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => `${c.label}: ${c.raw}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [vehicles, loading]);

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">
            Fleet Status
          </h3>
          <p className="text-sm text-slate-500">
            Tình trạng các phương tiện.
          </p>
        </div>
        <button
          onClick={() => navigate("/transports-management")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-center">
        {/* Donut */}
        <div className="col-span-12 sm:col-span-5">
          <div className="relative aspect-square max-w-[190px] mx-auto">
            <canvas
              ref={donutRef}
              aria-label="Tình trạng xe"
            ></canvas>

            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">
                  {loading ? "..." : totalVehicles}
                </div>
                <div className="text-slate-500 text-xs tracking-wide">
                  TỔNG SỐ XE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
          <LegendRow
            color="#0b2875"
            label="Đang sử dụng"
            value={loading ? "..." : statusData.IN_USE.toString()}
          />
          <LegendRow
            color="#2563eb"
            label="Sẵn sàng"
            value={loading ? "..." : statusData.AVAILABLE.toString()}
          />
          <LegendRow
            color="#d97706"
            label="Bảo trì"
            value={loading ? "..." : statusData.MAINTENANCE.toString()}
          />
          <LegendRow
            color="#ef4444"
            label="Offline"
            value={loading ? "..." : statusData.OFFLINE.toString()}
          />
        </ul>
      </div>
    </section>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      {label}
      <span className="ml-auto font-semibold">{value}</span>
    </li>
  );
}
