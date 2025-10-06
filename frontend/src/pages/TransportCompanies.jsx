import React, { useCallback, useMemo, useState } from "react";
import Filters from "../components/companies/Filters";
import CompaniesTable from "../components/companies/CompaniesTable";
import CompanyModal from "../components/companies/CompanyModal";

// ==== DATA DEMO ====
const COMPANIES = [
  {
    name: "Công ty Gemadept",
    area: "Toàn quốc",
    cost: 200000,
    rating: 4.7,
    reviews: 1248,
    stats: { orders12m: 3482, ontimeRate: 97.2, csat: 4.8 },
    sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
    services: { cold: true, danger: false, loading: true, insurance: true },
    address: "2 Hải Phòng, Q.1, TP.HCM",
    phone: "028 1234 5678",
  },
  {
    name: "Công ty CP Transimex",
    area: "Nội thành HCM, Liên tỉnh",
    cost: 170000,
    rating: 4.4,
    reviews: 689,
    stats: { orders12m: 2214, ontimeRate: 95.5, csat: 4.5 },
    sizes: ["≤ 2 tấn", "≤ 4 tấn", "Xe lạnh"],
    services: { cold: true, danger: true, loading: false, insurance: true },
    address: "36 Tân Thuận, Quận 7, TP.HCM",
    phone: "028 3777 8888",
  },
  {
    name: "Công ty CP vận tải dầu khí Bình Dương",
    area: "Miền Nam, Bắc–Nam",
    cost: 140000,
    rating: 4.2,
    reviews: 312,
    stats: { orders12m: 1210, ontimeRate: 93.1, csat: 4.2 },
    sizes: ["≤ 4 tấn", "Container 20ft", "Container 40ft"],
    services: { cold: false, danger: false, loading: true, insurance: false },
    address: "25 QL13, TP. Thủ Dầu Một, Bình Dương",
    phone: "0274 222 3333",
  },
  {
    name: "Công ty giao nhận toàn cầu DHL",
    area: "Toàn quốc",
    cost: 185000,
    rating: 4.6,
    reviews: 998,
    stats: { orders12m: 2890, ontimeRate: 96.3, csat: 4.6 },
    sizes: ["≤ 2 tấn", "≤ 4 tấn"],
    services: { cold: false, danger: true, loading: false, insurance: true },
    address: "86 Mai Chí Thọ, TP. Thủ Đức, TP.HCM",
    phone: "1900 545 548",
  },
];

// ==== Helpers ====
const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const strip = (s) => (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function TransportCompanies() {
  // State bộ lọc
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("recommended");

  // Bộ lọc nâng cao
  const [showAdv, setShowAdv] = useState(false);
  const [svcCold, setSvcCold] = useState(false);
  const [svcDanger, setSvcDanger] = useState(false);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcInsurance, setSvcInsurance] = useState(false);
  const [cargoType, setCargoType] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  // Modal
  const [selected, setSelected] = useState(null);

  const matchAdvanced = useCallback(
    (c) => {
      if (svcCold && !c.services.cold) return false;
      if (svcDanger && !c.services.danger) return false;
      if (svcLoading && !c.services.loading) return false;
      if (svcInsurance && !c.services.insurance) return false;
      if (cargoType === "Lạnh" && !c.services.cold) return false;
      if (cargoType === "Nguy hiểm" && !c.services.danger) return false;
      return true;
    },
    [svcCold, svcDanger, svcLoading, svcInsurance, cargoType]
  );

  const filtered = useMemo(() => {
    const f = strip(from);
    const t = strip(to);
    const s = strip(size);
    const term = `${f} ${t}`.trim();

    let list = COMPANIES.filter((c) => {
      const area = strip(c.area);
      const areaOK =
        area.includes("toan quoc") ||
        (term &&
          (area.includes("mien") ||
            area.includes("lien tinh") ||
            (area.includes("noi thanh hcm") &&
              (term.includes("hcm") || term.includes("ho chi minh") || term.includes("sai gon"))))) ||
        !term;

      const sizeOK = !s || c.sizes.some((x) => strip(x).includes(s));
      return areaOK && sizeOK && matchAdvanced(c);
    });

    switch (sort) {
      case "priceAsc":  list.sort((a, b) => a.cost - b.cost); break;
      case "priceDesc": list.sort((a, b) => b.cost - a.cost); break;
      case "ratingDesc":list.sort((a, b) => b.rating - a.rating); break;
      default:          list.sort((a, b) => b.rating * 1000 - b.cost - (a.rating * 1000 - a.cost));
    }
    return list;
  }, [from, to, size, sort, matchAdvanced]);

  const handleSwap = () => {
    const a = from;
    setFrom(to);
    setTo(a);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh sách công ty vận tải được đề xuất</h1>
          <p className="text-blue-600">List of recommended transport companies</p>
        </div>
      </header>

      {/* Bộ lọc + nâng cao */}
      <Filters
        from={from} to={to} size={size} sort={sort}
        showAdv={showAdv} svcCold={svcCold} svcDanger={svcDanger} svcLoading={svcLoading} svcInsurance={svcInsurance}
        cargoType={cargoType} pickupTime={pickupTime}
        setFrom={setFrom} setTo={setTo} setSize={setSize} setSort={setSort}
        toggleAdv={() => setShowAdv(v => !v)}
        setSvcCold={setSvcCold} setSvcDanger={setSvcDanger} setSvcLoading={setSvcLoading} setSvcInsurance={setSvcInsurance}
        setCargoType={setCargoType} setPickupTime={setPickupTime}
        onSwap={handleSwap}
        onSearch={() => {/* gắn gọi API nếu cần */}}
      />

      {/* Bảng kết quả */}
      <CompaniesTable list={filtered} fmtVND={fmtVND} onSelect={setSelected} />

      {/* Modal chi tiết */}
      {selected && (
        <CompanyModal company={selected} onClose={() => setSelected(null)} fmtVND={fmtVND} />
      )}
    </div>
  );
}
