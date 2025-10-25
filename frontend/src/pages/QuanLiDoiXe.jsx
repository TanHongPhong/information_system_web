import React, { useMemo, useState } from "react";

// import từng component
import TransportLocalStyles from "../components/quan li doi xe/TransportLocalStyles";
import VehiclesList from "../components/quan li doi xe/VehiclesList";
import TruckInfoPanel from "../components/quan li doi xe/TruckInfoPanel";
import LoadManagementBar from "../components/quan li doi xe/LoadManagementBar";
import LoadNote from "../components/quan li doi xe/LoadNote";
import OrdersGrid from "../components/quan li doi xe/OrdersGrid";

// ===== Mock data (giữ sát HTML) =====
const VEHICLES = [
  {id:"SHIPID 02", plate:"DL04MP7045", driver:"Trần Minh", status:"arriving", route:"Bình Định–Đà Nẵng", start:[13.7765,109.2237], end:[16.0544,108.2022], times:["9/9/2025, 6:00","9/9/2025, 10:00","11/9/2025, 20:00","11/9/2025, 22:00"], active:1},
  {id:"SHIPID 03", plate:"51D-678.90", driver:"N. Hòa", status:"loading", route:"Vũng Tàu–TPHCM", start:[10.3459,107.0843], end:[10.8231,106.6297], times:["20/7/2025, 7:00","20/7/2025, 10:00","21/7/2025, 20:00","21/7/2025, 5:00"], active:1},
  {id:"SHIPID 04", plate:"29C-112.34", driver:"P. Hải", status:"preparing", route:"Hà Nội–Ninh Bình", start:[21.0278,105.8342], end:[20.2534,105.9750], times:["12/8/2025, 8:00","12/8/2025, 12:00","13/8/2025, 18:00","13/8/2025, 21:00"], active:0},
  {id:"SHIPID 05", plate:"51A-889.77", driver:"V. Nam", status:"unloading", route:"TPHCM–Cần Thơ", start:[10.8231,106.6297], end:[10.0452,105.7469], times:["10/8/2025, 6:00","10/8/2025, 9:30","10/8/2025, 18:00","10/8/2025, 21:30"], active:2},
  {id:"SHIPID 06", plate:"43C-909.10", driver:"T. Lợi", status:"arriving", route:"Đà Nẵng–Huế", start:[16.0544,108.2022], end:[16.4637,107.5909], times:["5/8/2025, 6:00","5/8/2025, 10:00","5/8/2025, 18:00","5/8/2025, 20:00"], active:3},
  {id:"SHIPID 07", plate:"88C-335.55", driver:"Đ. Trung", status:"loading", route:"Vĩnh Phúc–Hà Nội", start:[21.3083,105.6049], end:[21.0278,105.8342], times:["2/9/2025, 7:00","2/9/2025, 9:30","2/9/2025, 14:00","2/9/2025, 16:00"], active:1},
  {id:"SHIPID 08", plate:"72C-456.78", driver:"Q. Huy", status:"preparing", route:"Bà Rịa–Vũng Tàu", start:[10.5473,107.2429], end:[10.3459,107.0843], times:["1/9/2025, 8:00","1/9/2025, 10:00","1/9/2025, 15:00","1/9/2025, 18:00"], active:0},
  {id:"SHIPID 09", plate:"63C-555.88", driver:"Q. Vũ", status:"preparing", route:"Hà Nội–Hải Phòng", start:[21.0278,105.8342], end:[20.8449,106.6881], times:["12/12/2025, 9:00","12/12/2025, 12:00","14/12/2025, 15:00","14/12/2025, 20:00"], active:0},
  {id:"SHIPID 10", plate:"50F-999.11", driver:"K. Bình", status:"departed", route:"TPHCM–Đà Lạt", start:[10.8231,106.6297], end:[11.9404,108.4583], times:["8/9/2025, 6:00","8/9/2025, 9:00","8/9/2025, 17:00","8/9/2025, 22:00"], active:3},
  {id:"SHIPID 11", plate:"36C-222.66", driver:"H. Hà", status:"loading", route:"Thanh Hóa–Nghệ An", start:[19.8067,105.7856], end:[18.6736,105.6923], times:["6/9/2025, 6:00","6/9/2025, 10:00","6/9/2025, 19:30","6/9/2025, 22:00"], active:1},
  {id:"SHIPID 12", plate:"14C-777.00", driver:"B. Sơn", status:"arriving", route:"Quảng Ninh–Hải Phòng", start:[20.9711,107.0448], end:[20.8449,106.6881], times:["4/9/2025, 7:00","4/9/2025, 11:30","4/9/2025, 18:00","4/9/2025, 20:30"], active:2},
  {id:"SHIPID 13", plate:"92C-313.14", driver:"T. Dũng", status:"unloading", route:"Quảng Nam–Đà Nẵng", start:[15.5736,108.4740], end:[16.0544,108.2022], times:["3/9/2025, 8:00","3/9/2025, 10:00","3/9/2025, 13:45","3/9/2025, 16:00"], active:2},
];

const ORDERS = [
  {id:"ORDER 0155",weight:88.9,route:"Bình Định – Đà Nẵng",date:"11/9/2025"},
  {id:"ORDER 7723",weight:76,route:"Bình Định – Đà Nẵng",date:"11/9/2025"},
  {id:"ORDER 0856",weight:88.9,route:"Bình Định – Đà Nẵng",date:"11/9/2025"},
  {id:"ORDER 6655",weight:96,route:"Bình Định – Đà Nẵng",date:"11/9/2025"},
  {id:"ORDER 0152",weight:99,route:"Quy Nhơn – Đà Nẵng",date:"10/9/2025"},
  {id:"ORDER 2353",weight:100,route:"Quy Nhơn – Đà Nẵng",date:"10/9/2025"},
  {id:"ORDER 0123",weight:88.9,route:"Quy Nhơn – Đà Nẵng",date:"10/9/2025"},
  {id:"ORDER 0128",weight:88.9,route:"Quy Nhơn – Đà Nẵng",date:"10/9/2025"},
  {id:"ORDER 5923",weight:160,route:"Đà Nẵng – Huế",date:"11/9/2025"},
  {id:"ORDER 0156",weight:187,route:"Đà Nẵng – Huế",date:"11/9/2025"},
  {id:"ORDER 0178",weight:165.9,route:"Bình Dương – TP.HCM",date:"10/9/2025"},
  {id:"ORDER 0243",weight:88.9,route:"Bình Dương – TP.HCM",date:"10/9/2025"},
];

export default function TransportDashboard() {
  const [selectedId, setSelectedId] = useState(VEHICLES[0].id);
  const [loadPercent] = useState(50); // có thể nối vào state/slider trong tương lai

  const selected = useMemo(
    () => VEHICLES.find((v) => v.id === selectedId) || VEHICLES[0],
    [selectedId]
  );

  return (
    <div className="bg-[#F8F9FD] text-slate-900">
      <TransportLocalStyles />

      <div className="grid grid-cols-[390px_1fr] gap-6 p-6 min-h-[70vh]">
        {/* LEFT: Vehicles */}
        <section className="flex flex-col min-h-0">
          <div className="sticky top-0 bg-gradient-to-b from-white to-transparent pb-2 z-10">
            <h2 className="text-[20px]">Vehicles</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600">Loading</button>
              <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600">Unloading</button>
              <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600">Arriving</button>
              <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600">Preparing</button>
            </div>
          </div>

          <VehiclesList
            vehicles={VEHICLES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        {/* RIGHT */}
        <section className="flex flex-col min-h-0">
          <TruckInfoPanel selected={selected} loadPercent={loadPercent} maxTon={15} />

          <div className="mt-2">
            <LoadManagementBar loadPercent={loadPercent} maxTon={15} />
            <LoadNote />
            <OrdersGrid orders={ORDERS} />
          </div>
        </section>
      </div>
    </div>
  );
}
