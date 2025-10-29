// App.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import CargoPage from "../components/nhap_in4/CargoPage";

export default function App() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const vehicleId = searchParams.get("vehicleId");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px]">
        <CargoPage companyId={companyId} vehicleId={vehicleId} />
      </main>
    </div>
  );
}
