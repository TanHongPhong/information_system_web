import { useMemo, useRef, useState } from "react";
import { DATA } from "../components/warehouse/MockWarehouse";

import TitleControls from "../components/warehouse/TitleControls";
import KpiStrip from "../components/warehouse/KpiStrip";
import WarehouseTable from "../components/warehouse/WarehouseTable";
import QRScannerPanel from "../components/warehouse/QRScannerPanel";
import InventorySnapshotCard from "../components/warehouse/InventorySnapshotCard";
import StaffShiftCard from "../components/warehouse/StaffShiftCard";
import LegendDots from "../components/warehouse/LegendDots";

export default function WarehouseInOutPage() {
  // Filters
  const [tab, setTab]   = useState("all");
  const [dock, setDock] = useState("Tất cả");
  const [temp, setTemp] = useState("Tất cả");

  // QR state (headless)
  const [mode, setMode] = useState("IN");         // "IN" | "OUT"
  const [cameras, setCameras] = useState([]);     // [{deviceId, label}]
  const [currentCameraId, setCurrentCameraId] = useState("");
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const readerRef = useRef(null); // where you mount external scanner

  // Mock: discover cameras once (optional)
  // useEffect(() => { navigator.mediaDevices?.enumerateDevices?.().then(...); }, []);

  const baseRows = useMemo(
    () => (tab === "all" ? DATA : DATA.filter(d => d.type === tab)),
    [tab]
  );

  const rows = useMemo(
    () => baseRows.filter(d =>
      (dock === "Tất cả" || d.docks === dock) &&
      (temp === "Tất cả" || d.temp  === temp)
    ),
    [baseRows, dock, temp]
  );

  function handleReload() {
    // nơi bạn gọi API refresh; demo chỉ re-calc
    // eslint-disable-next-line no-console
    console.log("Reload KPIs/Table");
  }

  function exportCSV() {
    const header = ["Mã đơn","Loại","Trạng thái","Khách hàng","Điểm đi","Điểm đến","Pallets","Khối lượng","Door","Xe/Container","Ngày"];
    const lines = [header.join(",")].concat(
      rows.map(o => [
        o.id, o.type, o.status, o.customer, o.from, o.to, o.pallets, `${o.weight} ${o.unit}`, o.docks, o.carrier, o.eta
      ].map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "warehouse_in_out.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // QR handlers (bạn gắn lib thật ở đây)
  const onModeChange = m => setMode(m);
  const onPickCamera = id => setCurrentCameraId(id);
  const onSwitchCamera = () => {
    if (!cameras.length) return;
    const idx = cameras.findIndex(c => c.deviceId === currentCameraId);
    const next = cameras[(idx + 1) % cameras.length];
    setCurrentCameraId(next?.deviceId || "");
  };
  const onStart = async () => {
    // Mount scanner lib (vd html5-qrcode) vào readerRef.current
    setRunning(true);
    // giả lập kết quả:
    setTimeout(() => {
      setLastResult("DL04MP7045|PALLET=8|MODE="+mode);
      setRunning(false);
    }, 1200);
  };
  const onPause = async () => setRunning(false);

  return (
    <section className="p-6 md:p-8 space-y-6">
      <TitleControls
        tab={tab} dock={dock} temp={temp}
        onChangeTab={setTab} onChangeDock={setDock}
        onChangeTemp={setTemp} onReload={handleReload}
      />

      <KpiStrip baseRows={baseRows} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <section className="xl:col-span-2 space-y-4">
          <WarehouseTable rows={rows} onExport={exportCSV} />
        </section>

        {/* Right 1/3 */}
        <aside className="xl:col-span-1 flex flex-col gap-5">
          <QRScannerPanel
            mode={mode}
            cameras={cameras}
            currentCameraId={currentCameraId}
            running={running}
            lastResult={lastResult}
            onModeChange={onModeChange}
            onStart={onStart}
            onPause={onPause}
            onSwitchCamera={onSwitchCamera}
            onPickCamera={onPickCamera}
          />
          <LegendDots />
          <InventorySnapshotCard />
          <StaffShiftCard />
        </aside>
      </div>
    </section>
  );
}
