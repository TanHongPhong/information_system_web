// src/pages/OrderTrackingPage.jsx
import React, { useState } from "react";

import SidebarTrack from "../components/tracking/SidebarTrack";
import TopbarTrack from "../components/tracking/TopbarTrack";
import OrderSearchPanel from "../components/tracking/OrderSearchPanel";
import MapPanel from "../components/tracking/MapPanel";
import StatusPanel from "../components/tracking/StatusPanel";
import VehicleDetailsPanel from "../components/tracking/VehicleDetailsPanel";

export default function OrderTrackingPage() {
  // giữ chiều cao map để StatusPanel match
  const [mapHeight, setMapHeight] = useState(null);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-['Inter',ui-sans-serif,system-ui] flex overflow-hidden">
      {/* Sidebar bên trái */}
      <SidebarTrack />

      {/* Phần nội dung phải (header + 3 cột) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* topbar */}
        <TopbarTrack />

        {/* main grid */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="p-4 grid grid-cols-12 gap-4 h-full min-h-0 lg:overflow-hidden">
            {/* LEFT: Order Search */}
            <div className="col-span-12 lg:col-span-3 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0">
                <OrderSearchPanel />
              </div>
            </div>

            {/* CENTER: Map */}
            <div className="col-span-12 lg:col-span-6 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                <MapPanel onMapHeight={setMapHeight} />
              </div>
            </div>

            {/* RIGHT: Status + Vehicle */}
            <div className="col-span-12 lg:col-span-3 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-4">
                <StatusPanel progress={0.6} mapHeight={mapHeight} />
                <VehicleDetailsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
