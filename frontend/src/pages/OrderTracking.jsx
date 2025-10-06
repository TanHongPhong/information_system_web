import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";
import Sidebar from "../components/tracking/Sidebar";
import Topbar from "../components/tracking/Topbar";
import OrderSearch from "../components/tracking/OrderSearch";
import MapCard from "../components/tracking/MapCard";
import StatusCard from "../components/tracking/StatusCard";
import VehicleDetails from "../components/tracking/VehicleDetails";

export default function OrderTrackingPage() {
  // Featured & list (thay cho <template> + render JS thuần)
  const featured = {
    title: "ShipID-0123",
    orderCode: "DL04MP7045",
    capacityNote: "Tải trọng tối đa 6.5 tấn",
    mapThumb: "https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg",
    route: ["Departure: TP.Hồ Chí Minh", "Stop 01: Quảng Ngãi", "Stop 02: Thanh Hóa", "Arrival: Hà Nội"],
  };

  const list = useMemo(
    () =>
      ["0124", "0125", "0126", "0127", "0128", "0129", "0130", "0131", "0132", "0133"].map((id) => ({
        id,
        title: `ShipID-${id}`,
        orderCode: "DL04MP7045",
        capacityNote: "Tải trọng tối đa 6.5 tấn",
      })),
    []
  );

  // Progress & steps
  const [progress] = useState(0.6); // 60%
  const steps = [
    {
      title: "Departure",
      time: "17/7/2024, 10:00",
      address: "279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM",
      state: "done",
    },
    {
      title: "Stop",
      time: "17/7/2024, 12:00",
      address: "76 Nguyễn Tất Thành, Quảng Ngãi",
      state: "current",
      badges: [
        { kind: "primary", icon: "clock", text: "Đang xử lý (15’)" },
        { kind: "ok", text: "ON TIME" },
      ],
    },
    {
      title: "Stop",
      time: "17/7/2024, 20:00",
      address: "36 Phạm Văn Đồng, Thanh Hóa",
      state: "future",
    },
    {
      title: "Arrival",
      time: "21/7/2024, 10:00",
      address: "777 Lê Lợi, P.3, Q.1, TP.Hà Nội",
      state: "future",
      variant: "muted",
    },
  ];

  // Đồng bộ chiều cao StatusCard với Map
  const mapRef = useRef(null);
  const [mapHeight, setMapHeight] = useState(null);

  useEffect(() => {
    const syncHeights = () => {
      if (mapRef.current) setMapHeight(mapRef.current.offsetHeight);
      // set CSS var cho topbar height
      const el = document.getElementById("topbar");
      if (el) document.documentElement.style.setProperty("--topbar-h", el.offsetHeight + "px");
    };
    syncHeights();
    window.addEventListener("resize", syncHeights);
    return () => window.removeEventListener("resize", syncHeights);
  }, []);

  // Feather icons
  useEffect(() => {
    feather.replace({ width: 21, height: 21 });
  }, []);
  useEffect(() => {
    feather.replace();
  }, [list, steps, progress, mapHeight]);

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Global styles cần cho scroll & font */}
      <style>{`
        :root{ --sidebar-w: 80px; }
        body{ font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial }
        .order-scroll{ scrollbar-width: thin; scrollbar-color: rgba(2,6,23,.35) transparent; }
        .order-scroll::-webkit-scrollbar{ width: 8px; }
        .order-scroll::-webkit-scrollbar-thumb{ background: rgba(2,6,23,.18); border-radius: 8px; }
        .order-scroll:hover::-webkit-scrollbar-thumb{ background: rgba(2,6,23,.35); }
        @media (min-width:1024px){ html, body{ overflow: hidden; } }
        .card{ border-radius:16px; box-shadow:0 8px 24px rgba(15,23,42,.08) }
        .badge{ font-size:10px; padding:.15rem .45rem; border-radius:9999px; letter-spacing:.3px; }
      `}</style>

      <Sidebar />
      <Topbar />

      <main className="pt-[64px] lg:overflow-hidden" style={{ marginLeft: "80px" }}>
        <div className="p-4 grid grid-cols-12 gap-4">
          <OrderSearch featured={featured} list={list} />
          <MapCard ref={mapRef} />
          <section className="col-span-12 lg:col-span-3">
            <div className="sticky" style={{ top: "calc(var(--topbar-h,64px) + 16px)" }}>
              <div className="order-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="space-y-4">
                  <StatusCard progress={progress} steps={steps} mapHeight={mapHeight ? `${mapHeight}px` : undefined} />
                  <VehicleDetails />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
