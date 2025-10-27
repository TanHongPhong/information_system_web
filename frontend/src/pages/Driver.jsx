import React from "react";
import DriverHeader from "../components/driver/DriverHeader";
import VehicleRouteCard from "../components/driver/VehicleRouteCard";
import PreTripChecklist from "../components/driver/PreTripChecklist";
import OrdersOnTruck from "../components/driver/OrdersOnTruck";

export default function DriverPage() {
  // dữ liệu đơn mặc định (5 đơn giống HTML)
  const ordersData = [
    {
      id: "ORDER 0155",
      weight: "88,9",
      route: "Bình Định – Đà Nẵng",
      date: "11/9/2025",
      color: "sky",
    },
    {
      id: "ORDER 7723",
      weight: "76",
      route: "Bình Định – Đà Nẵng",
      date: "11/9/2025",
      color: "indigo",
    },
    {
      id: "ORDER 0856",
      weight: "88,9",
      route: "Bình Định – Đà Nẵng",
      date: "11/9/2025",
      color: "emerald",
    },
    {
      id: "ORDER 6655",
      weight: "96",
      route: "Bình Định – Đà Nẵng",
      date: "11/9/2025",
      color: "amber",
    },
    {
      id: "ORDER 0152",
      weight: "99",
      route: "Quy Nhơn – Đà Nẵng",
      date: "10/9/2025",
      color: "rose",
    },
  ];

  // style nền radial-gradient y chang <body> gốc
  const pageBgStyle = {
    background:
      "radial-gradient(1200px 600px at -10% -10%, rgba(37,99,235,.08), transparent 60%)," +
      "radial-gradient(900px 500px at 110% -10%, rgba(37,99,235,.06), transparent 60%)," +
      "#ffffff",
  };

  return (
    <div
      className="w-full min-h-[100svh] font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-slate-900 flex justify-center"
      style={pageBgStyle}
    >
      {/* khung max-w-sm giống mobile */}
      <div className="mx-auto max-w-sm min-h-[100svh] flex flex-col w-full">
        <DriverHeader />

        <main className="flex-1 px-4 py-4 space-y-4">
          <VehicleRouteCard
            plate="51C-789.45"
            statusText="Đang hoạt động"
            fromLabel="TP. Hồ Chí Minh"
            toLabel="Hà Nội"
          />

          <PreTripChecklist />

          <OrdersOnTruck orders={ordersData} />
        </main>

        <footer className="px-4 pb-[env(safe-area-inset-bottom)] pt-2">
          <p className="text-center text-[11px] text-slate-400">
            6A Logistics · mobile
          </p>
        </footer>
      </div>
    </div>
  );
}
