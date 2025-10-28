// App.jsx
import React from "react";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import CargoPage from "../components/nhap_in4/CargoPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px]">
        <CargoPage />
      </main>
    </div>
  );
}
