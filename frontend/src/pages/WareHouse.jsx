import React, { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import Sidebar from "../components/warehouse/Sidebar";
import Topbar from "../components/warehouse/Topbar";
import DataTable from "../components/warehouse/DataTable";
import QRScannerPanel from "../components/warehouse/QRScannerPanel";

// Mock data
const DATA = [
  { id: "DL04MP7045", type: "in",  status: "Đang vận chuyển", customer: "Đặng Huy Tuấn",   from: "Lào tồn",     to: "TP.HCM",    weight: 250,  unit: "KG", pallets: 8,  docks: "D1", carrier: "GMD-TRK-21", eta: "12/12/2025", temp: "Thường" },
  { id: "DL04MP7046", type: "out", status: "Đã xuất kho",     customer: "Thái Lý Lộc",     from: "Bình Định",  to: "Hà Nội",    weight: 2000, unit: "KG", pallets: 12, docks: "D3", carrier: "GMD-TRK-07", eta: "01/12/2025", temp: "Mát" },
  { id: "DL04MP7054", type: "in",  status: "Lưu kho",         customer: "Tân Hồng Phong",  from: "Vũng Tàu",   to: "Đồng Nai",  weight: 540,  unit: "KG", pallets: 10, docks: "D2", carrier: "GMD-TRK-12", eta: "12/07/2025", temp: "Mát" },
  { id: "DL04MP7525", type: "in",  status: "Đang vận chuyển", customer: "Ngô Trọng Nhân",  from: "Đồng Nai",   to: "Nha Trang", weight: 938,  unit: "KG", pallets: 15, docks: "D5", carrier: "GMD-TRK-33", eta: "20/07/2025", temp: "Lạnh" },
  { id: "DL04MP9845", type: "out", status: "Đang vận chuyển", customer: "Lê Quang Trường", from: "Khánh Hoà",  to: "TP.HCM",    weight: 12000,unit: "KG", pallets: 25, docks: "D4", carrier: "GMD-TRK-08", eta: "12/01/2025", temp: "Thường" },
  { id: "DL04MP7875", type: "in",  status: "Lưu kho",         customer: "Thái Lý Lộc",     from: "Cà Mau",     to: "Hà Nội",    weight: 250,  unit: "KG", pallets: 6,  docks: "D2", carrier: "GMD-TRK-02", eta: "22/06/2025", temp: "Thường" },
  { id: "DL04MP7995", type: "out", status: "Lưu kho",         customer: "Ngô Trọng Nhân",  from: "Bến Tre",    to: "Cà Mau",    weight: 370,  unit: "KG", pallets: 9,  docks: "D6", carrier: "GMD-TRK-19", eta: "19/01/2025", temp: "Mát" },
  { id: "DL04MP4545", type: "in",  status: "Đang vận chuyển", customer: "Đặng Huy Tuấn",   from: "Vũng Tàu",   to: "Vĩnh Long", weight: 920,  unit: "KG", pallets: 14, docks: "D1", carrier: "GMD-TRK-17", eta: "17/08/2025", temp: "Thường" },
];

export default function WarehouseInOutPage() {
  const [tab, setTab] = useState("all");      // all | in | out | hold
  const [dock, setDock] = useState("Tất cả");
  const [temp, setTemp] = useState("Tất cả");

  const base = useMemo(() => (tab === "all" ? DATA : DATA.filter(d => d.type === tab)), [tab]);
  const filtered = useMemo(
    () => base.filter(d => (dock === "Tất cả" || d.docks === dock) && (temp === "Tất cả" || d.temp === temp)),
    [base, dock, temp]
  );
  const baseCountInTransit = useMemo(() => base.filter(d => d.status === "Đang vận chuyển").length, [base]);

  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);
  useEffect(() => { feather.replace(); }, [filtered, tab, dock, temp]);

  const exportCSV = () => {
    const header = ["Mã đơn","Loại","Trạng thái","Khách hàng","Điểm đi","Điểm đến","Pallets","Khối lượng","Door","Xe/Container","Ngày"];
    const lines = [header.join(",")].concat(
      filtered.map(o => [o.id,o.type,o.status,o.customer,o.from,o.to,o.pallets,`${o.weight} ${o.unit}`,o.docks,o.carrier,o.eta]
        .map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "warehouse_in_out.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <style>{`
        html, body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        :is(button, a, select, input, details, summary):focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
        .thin-scrollbar::-webkit-scrollbar{height:8px;width:8px}
        .thin-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:9999px}
        .thin-scrollbar::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <Sidebar />

      <main className="ml-20">
        <Topbar />

        <section className="p-6 md:p-8 space-y-6">
          {/* Controls inline */}
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Quản lý nhập / xuất kho</h2>
              <p className="text-slate-600">Theo dõi real-time, QR check-in/out, KPI & công suất kho.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["all","in","out","hold"].map((k,i)=>(
                <button
                  key={k}
                  onClick={()=>setTab(k)}
                  className={[
                    "h-10 px-3 rounded-xl text-sm border",
                    tab===k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {["Tất cả","Nhập kho","Xuất kho","Đang giữ tạm"][i]}
                </button>
              ))}
              <select value={dock} onChange={e=>setDock(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {["Tất cả","D1","D2","D3","D4","D5","D6"].map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={temp} onChange={e=>setTemp(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {["Tất cả","Thường","Mát","Lạnh"].map(t=><option key={t}>{t}</option>)}
              </select>
              <button onClick={()=>feather.replace()} className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2">
                <i data-feather="refresh-cw" className="w-4 h-4" /><span>Tải lại</span>
              </button>
            </div>
          </div>

          {/* KPI inline */}
          <div className="grid md:grid-cols-5 gap-3">
            <div className="rounded-2xl p-4 border border-slate-200 bg-blue-50">
              <div className="flex items-center gap-2 text-sm text-slate-500"><i data-feather="package" className="w-4 h-4" />Đã nhập hôm nay</div>
              <div className="mt-1 text-2xl font-bold">34</div>
            </div>
            <div className="rounded-2xl p-4 border border-slate-200 bg-indigo-50">
              <div className="flex items-center gap-2 text-sm text-slate-500"><i data-feather="truck" className="w-4 h-4" />Đã xuất hôm nay</div>
              <div className="mt-1 text-2xl font-bold">29</div>
            </div>
            <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-500"><i data-feather="truck" className="w-4 h-4" />Đang vận chuyển</div>
              <div className="mt-1 text-2xl font-bold">{baseCountInTransit}</div>
            </div>
            <div className="rounded-2xl p-4 border border-slate-200 bg-rose-50">
              <div className="flex items-center gap-2 text-sm text-slate-500"><i data-feather="alert-triangle" className="w-4 h-4" />Cảnh báo</div>
              <div className="mt-1 text-2xl font-bold">2</div>
              <div className="text-[12px] text-slate-500 mt-1">Thiếu chứng từ: 1 • Lệch khối lượng: 1</div>
            </div>
            <div className="rounded-2xl p-4 border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-sm text-slate-500"><i data-feather="activity" className="w-4 h-4" />Công suất kho</div>
              <div className="mt-2"><div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{width:"72%"}} />
              </div></div>
              <div className="text-[12px] text-slate-500 mt-1">72% sử dụng • 1.450/2.000 pallets</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 space-y-4">
              <DataTable rows={filtered} onExport={exportCSV} />
            </section>

            <aside className="xl:col-span-1 flex flex-col gap-5">
              <QRScannerPanel />

              {/* Legend inline */}
              <div className="text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" />
                  <span>NHẬP HÀNG (INBOUND)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                  <span>XUẤT HÀNG (OUTBOUND)</span>
                </div>
              </div>

              {/* Inventory snapshot inline */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-600"><i data-feather="box" className="w-4 h-4" /> Tồn kho nhanh</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Kệ thường</span><span className="font-medium">1.120 pallets</span></div>
                  <div className="flex justify-between"><span>Kho mát</span><span className="font-medium">210 pallets</span></div>
                  <div className="flex justify-between"><span>Kho lạnh</span><span className="font-medium">120 pallets</span></div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-600 mb-1">Tỷ lệ lấp đầy</div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{width:"72%"}} />
                  </div>
                </div>
              </div>

              {/* Staff inline */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-600"><i data-feather="users" className="w-4 h-4" /> Nhân sự ca hôm nay</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex justify-between"><span>Ca sáng</span><span className="text-slate-700">12 NV (2 QC, 1 Supervisor)</span></li>
                  <li className="flex justify-between"><span>Ca chiều</span><span className="text-slate-700">10 NV (1 QC, 1 Supervisor)</span></li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-xs mt-4 mb-6">© 2025 Gemadept – Trang quản lý nhập / xuất kho.</footer>
      </main>
    </div>
  );
}
