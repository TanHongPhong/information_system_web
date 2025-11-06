import React from "react";

// ================== ICON COMPONENTS (feather-like) ==================
const IconPackage = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12.01" />
  </svg>
);

const IconBarChart2 = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconInbox = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89a2 2 0 0 0-1.79-1.11H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconClock = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconHash = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconUser = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMapPin = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconActivity = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconPhone = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.37 1.6.72 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.29a2 2 0 0 1 2.11-.45c.74.35 1.53.6 2.34.72A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ====== BLOCK CON CHO THỐNG KÊ HÀNG DỌC ======
function StatRow({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border border-[#d8e6ff] text-[#1e4ed8] shadow-[0_8px_20px_rgba(37,99,235,.12),_inset_0_1px_0_rgba(255,255,255,.75)] bg-[linear-gradient(180deg,#eef4ff,#e6f0ff)]">
        <Icon className="w-[20px] h-[20px]" />
      </div>

      <div className="text-left min-w-0 flex-1">
        <div
          className="text-[12px] text-[#697386] mb-[2px]"
          style={{ fontWeight: 400 }}
        >
          {label}
        </div>
        <div
          className="text-[16px] leading-[1.3] text-[#1C2A44] break-words"
          style={{ fontWeight: 400 }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ====== CARD THÔNG TIN NHỎ (Biển số / Tài xế / ...) ======
function InfoCard({ Icon, k, v }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-[10px] border border-[#E5EAF2] bg-[#F8FBFF]">
      <div className="w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 border border-[#d8e6ff] text-[#1e4ed8] shadow-[0_6px_14px_rgba(37,99,235,.10),_inset_0_1px_0_rgba(255,255,255,.75)] bg-[linear-gradient(180deg,#eef4ff,#e6f0ff)]">
        <Icon className="w-[14px] h-[14px]" />
      </div>
      <div className="leading-[1.25] min-w-0 flex-1">
        <div
          className="text-[11px] text-[#64748B]"
          style={{ fontWeight: 400 }}
        >
          {k}
        </div>
        <div
          className="text-[13px] text-[#0F172A] whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ fontWeight: 400 }}
          title={v}
        >
          {v}
        </div>
      </div>
    </div>
  );
}

export default function TruckPanel({ vehicle, loadPercent, maxTon }) {
  // tính tải
  const usedTons = (maxTon * loadPercent) / 100;
  const freeTons = maxTon - usedTons;

  const plate = vehicle?.plate || "—";
  const driver = vehicle?.driver || "—";
  const currentLocation = vehicle?.location || vehicle?.current_location || "Chưa có thông tin";
  const statusTxt = vehicle?.status
    ? vehicle.status[0].toUpperCase() + vehicle.status.slice(1)
    : "—";

  return (
    <section
      className="flex flex-col md:flex-row justify-between gap-6 bg-white border border-[#EAEBF0] rounded-[12px] p-6 mb-4"
      style={{
        boxShadow: "0 8px 24px rgba(20,30,55,.08)",
      }}
    >
      {/* BÊN TRÁI: số liệu + cụm thông tin xe */}
      <div className="flex flex-col gap-5 text-[#1C2A44] w-full max-w-[320px] shrink-0 min-w-0">
        <div className="flex flex-col gap-4">
          <StatRow
            Icon={IconPackage}
            label="Khối lượng tải"
            value={`${usedTons.toFixed(1)} tấn`}
          />
          <StatRow
            Icon={IconBarChart2}
            label="Trọng lượng tối đa"
            value={`${maxTon} tấn`}
          />
          <StatRow
            Icon={IconInbox}
            label="Còn trống"
            value={`${freeTons.toFixed(1)} tấn`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-[13px] leading-[1.3]">
          <InfoCard Icon={IconHash} k="Biển số" v={plate} />
          <InfoCard Icon={IconUser} k="Tài xế" v={driver} />
          <InfoCard Icon={IconMapPin} k="Vị trí" v={currentLocation} />
          <InfoCard Icon={IconActivity} k="Trạng thái" v={statusTxt} />
          <InfoCard
            Icon={IconPhone}
            k="Liên hệ nhanh"
            v="Gọi tài xế / Điều phối"
          />
        </div>
      </div>

      {/* BÊN PHẢI: chiếc xe tải + overlay phần trăm cam */}
      <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
        <div
          className="relative w-full max-w-[580px] origin-center"
          style={{
            transform: "scale(0.9)",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,.08))",
          }}
        >
          {/* ảnh xe trắng */}
          <img
            className="block w-full h-auto max-w-none select-none pointer-events-none"
            src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png"
            alt="Truck"
          />

          {/* Hộp hàng màu cam overlay trên thùng xe */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "23%",
              top: "34.5%",
              width: "36%",
              height: "24%",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-[4px] overflow-hidden bg-[rgba(255,255,255,.55)] backdrop-blur-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
              <div
                className="h-full bg-[linear-gradient(90deg,#F5A623,#F29900)] shadow-[inset_0_0_10px_rgba(0,0,0,.06)]"
                style={{ width: `${loadPercent}%` }}
              />
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,.35)]"
              style={{
                fontSize: "clamp(14px,2vw,22px)",
                fontWeight: 400,
              }}
            >
              {loadPercent}%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
