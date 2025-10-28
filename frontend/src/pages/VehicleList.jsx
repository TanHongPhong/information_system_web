// App.jsx
import React, { useState } from "react";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import VehiclePage from "../components/vehicle/VehiclePage";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px] min-h-screen flex flex-col">
        <VehiclePage keyword={keyword} />
      </main>
    </div>
  );
}
