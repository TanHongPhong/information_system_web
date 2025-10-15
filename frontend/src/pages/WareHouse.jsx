import React, { useMemo, useState } from "react";

// Import từng file component (không import gộp)
import WarehouseLocalStyles from "../components/warehouse/WarehouseLocalStyles";
import TitleControls from "../components/warehouse/TitleControls";
import KPIRow from "../components/warehouse/KPIRow";
import TableCard from "../components/warehouse/TableCard";
import QRCameraCard from "../components/warehouse/QRCameraCard";
import Legend from "../components/warehouse/Legend";
import InventorySnapshot from "../components/warehouse/InventorySnapshot";
import StaffCard from "../components/warehouse/StaffCard";

// Mock data (giữ như bản HTML)
const DATA = [
  { id: "DL04MP7045", type: "in",  status: "Đang vận chuyển", customer: "Đặng Huy Tuấn",  from: "Lào tồn",   to: "TP.HCM",   weight: 250,   unit: "KG", pallets: 8,  docks: "D1", carrier: "GMD-TRK-21", eta: "12/12/2025", temp: "Thường" },
  { id: "DL04MP7046", type: "out", status: "Đã xuất kho",     customer: "Thái Lý Lộc",    from: "Bình Định", to: "Hà Nội",   weight: 2000,  unit: "KG", pallets: 12, docks: "D3", carrier: "GMD-TRK-07", eta: "01/12/2025", temp: "Mát" },
  { id: "DL04MP7054", type: "in",  status: "Lưu kho",         customer: "Tân Hồng Phong", from: "Vũng Tàu",  to: "Đồng Nai", weight: 540,   unit: "KG", pallets: 10, docks: "D2", carrier: "GMD-TRK-12", eta: "12/07/2025", temp: "Mát" },
  { id: "DL04MP7525", type: "in",  status: "Đang vận chuyển", customer: "Ngô Trọng Nhân", from: "Đồng Nai",  to: "Nha Trang",weight: 938,   unit: "KG", pallets: 15, docks: "D5", carrier: "GMD-TRK-33", eta: "20/07/2025", temp: "Lạnh" },
  { id: "DL04MP9845", type: "out", status: "Đang vận chuyển", customer: "Lê Quang Trường",from: "Khánh Hoà", to: "TP.HCM",   weight: 12000, unit: "KG", pallets: 25, docks: "D4", carrier: "GMD-TRK-08", eta: "12/01/2025", temp: "Thường" },
  { id: "DL04MP7875", type: "in",  status: "Lưu kho",         customer: "Thái Lý Lộc",    from: "Cà Mau",    to: "Hà Nội",   weight: 250,   unit: "KG", pallets: 6,  docks: "D2", carrier: "GMD-TRK-02", eta: "22/06/2025", temp: "Thường" },
  { id: "DL04MP7995", type: "out", status: "Lưu kho",         customer: "Ngô Trọng Nhân", from: "Bến Tre",   to: "Cà Mau",   weight: 370,   unit: "KG", pallets: 9,  docks: "D6", carrier: "GMD-TRK-19", eta: "19/01/2025", temp: "Mát" },
  { id: "DL04MP4545", type: "in",  status: "Đang vận chuyển", customer: "Đặng Huy Tuấn",  from: "Vũng Tàu",  to: "Vĩnh Long",weight: 920,   unit: "KG", pallets: 14, docks: "D1", carrier: "GMD-TRK-17", eta: "17/08/2025", temp: "Thường" },
];

export default function WarehouseInOutPage() {
  // bộ lọc
  const [tab, setTab] = useState("all");       // all | in | out | hold
  const [dock, setDock] = useState("Tất cả");  // Tất cả | D1..D6
  const [temp, setTemp] = useState("Tất cả");  // Tất cả | Thường | Mát | Lạnh
  const [reloadTick, setReloadTick] = useState(0);

  const baseRows = useMemo(() => {
    if (tab === "all") return DATA;
    if (tab === "hold") return []; // demo chưa có data "hold"
    return DATA.filter((d) => d.type === tab);
  }, [tab]);

  const filteredRows = useMemo(() => {
    return baseRows.filter(
      (d) =>
        (dock === "Tất cả" || d.docks === dock) &&
        (temp === "Tất cả" || d.temp === temp)
    );
  }, [baseRows, dock, temp]);

  // KPI demo
  const inboundToday = 34;
  const outboundToday = 29;
  const inTransitCount = baseRows.filter((d) => d.status === "Đang vận chuyển").length;
  const alertsCount = 2;
  const capacityUsedPercent = 72;

  return (
    <div className="bg-slate-50 text-slate-900">
      <WarehouseLocalStyles />

      <section className="p-6 md:p-8 space-y-6">
        <TitleControls
          tab={tab}
          dock={dock}
          temp={temp}
          onTabChange={setTab}
          onDockChange={setDock}
          onTempChange={setTemp}
          onReload={() => setReloadTick((t) => t + 1)}
        />

        <KPIRow
          inboundToday={inboundToday}
          outboundToday={outboundToday}
          inTransitCount={inTransitCount}
          alertsCount={alertsCount}
          capacityUsedPercent={capacityUsedPercent}
          key={reloadTick} // refresh nhẹ
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trái 2/3 */}
          <section className="xl:col-span-2 space-y-4">
            <TableCard rows={filteredRows} />
          </section>

          {/* Phải 1/3 */}
          <aside className="xl:col-span-1 flex flex-col gap-5">
            <QRCameraCard />
            <Legend />
            <InventorySnapshot />
            <StaffCard />
          </aside>
        </div>

        <footer className="text-center text-slate-400 text-xs mt-4 mb-2">
          © 2025 Gemadept – Trang quản lý nhập / xuất kho.
        </footer>
      </section>
    </div>
  );
}
