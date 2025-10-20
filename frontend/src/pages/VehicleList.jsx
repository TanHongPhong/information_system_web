// App.jsx
import React, { useState } from "react";
import Sidebar from "../components/vehicle/Sidebar";
import HeaderBar from "../components/vehicle/HeaderBar";
import VehiclePage from "../components/vehicle/VehiclePage";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <main className="ml-20 min-h-screen flex flex-col">
        <HeaderBar
          placeholder="Tìm tuyến đường, loại xe, tài xế..."
          keyword={keyword}
          onKeywordChange={setKeyword}
        />
        <VehiclePage keyword={keyword} />
      </main>
    </div>
  );
}
