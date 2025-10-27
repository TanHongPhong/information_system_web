import React from "react";

/* === Feather-style icons nội bộ (stroke=2) === */
function CubeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
      <polyline points="3.27 7.96 12 13 20.73 7.96" />
      <line x1="12" y1="22.76" x2="12" y2="13" />
    </svg>
  );
}

function BarChartIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function InboxIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" />
      <path d="M4 8V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
      <path d="M4 13h3l2 2h6l2-2h3" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HashIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MapPinIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4.5 8-11a8 8 0 1 0-16 0c0 6.5 8 11 8 11z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  );
}

function ActivityIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.36-.36a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/* === 1 dòng thông số lớn (Khối lượng tải / ETA...) === */
function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {/* icon ô vuông xanh nhạt */}
      <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-b from-sky-50 to-white text-blue-600 ring-1 ring-blue-200/60 shadow-[0_8px_20px_rgba(37,99,235,.12)] grid place-items-center">
        <Icon className="w-[22px] h-[22px] stroke-[1.8]" />
      </div>

      {/* text */}
      <div className="min-w-0 leading-[1.3]">
        <div className="text-[13px] text-slate-500">{label}</div>
        <div className="text-[18px] text-slate-900 font-normal break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

/* === ô thông tin nhỏ trong lưới 2 cột (Biển số / Tài xế / ...) === */
function InfoCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-200/60 bg-gradient-to-b from-white to-blue-50/20 px-3 py-2 text-slate-800">
      {/* icon nhỏ */}
      <div className="shrink-0 w-8 h-8 rounded-md bg-gradient-to-b from-white to-sky-50 text-blue-600 ring-1 ring-blue-200/60 grid place-items-center">
        <Icon className="w-[18px] h-[18px] stroke-[1.8]" />
      </div>

      {/* text */}
      <div className="min-w-0 leading-[1.3]">
        <div className="text-[12px] text-slate-500">{label}</div>
        <div className="text-[14px] text-slate-900 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

/* === COMPONENT CHÍNH === */
export default function TruckStatsPanel({
  vehicle,
  loadPercent,
  maxTon = 15,
}) {
  // tính toán tải hiện tại / còn trống
  const pct = loadPercent ?? 50;
  const currentTon = (pct * maxTon) / 100;
  const leftTon = maxTon - currentTon;

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,.08)] p-4 text-slate-800">
      {/* 4 dòng thông số lớn */}
      <div className="flex flex-col gap-4">
        <StatRow
          icon={CubeIcon}
          label="Khối lượng tải"
          value={`${currentTon.toFixed(1)} tấn`}
        />
        <StatRow
          icon={BarChartIcon}
          label="Trọng lượng tối đa"
          value={`${maxTon} tấn`}
        />
        <StatRow
          icon={InboxIcon}
          label="Còn trống"
          value={`${leftTon.toFixed(1)} tấn`}
        />
        <StatRow
          icon={ClockIcon}
          label="ETA dự kiến"
          value={vehicle?.eta || "11/9/2025, 22:00"}
        />
      </div>

      {/* Lưới 2 cột thông tin thêm */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px] leading-[1.35]">
        <InfoCell
          icon={HashIcon}
          label="Biển số"
          value={vehicle?.plate || "—"}
        />
        <InfoCell
          icon={UserIcon}
          label="Tài xế"
          value={vehicle?.driver || "—"}
        />
        <InfoCell
          icon={MapPinIcon}
          label="Tuyến"
          value={
            vehicle?.route
              ? vehicle.route.replace("–", " → ")
              : "—"
          }
        />
        <InfoCell
          icon={ActivityIcon}
          label="Trạng thái"
          value={
            vehicle?.status
              ? vehicle.status[0].toUpperCase() + vehicle.status.slice(1)
              : "—"
          }
        />
        <InfoCell
          icon={ClockIcon}
          label="Mốc kế tiếp"
          value={
            vehicle?.times?.[3] ? vehicle.times[3] : "—"
          }
        />
        <InfoCell
          icon={PhoneIcon}
          label="Liên hệ nhanh"
          value="Gọi tài xế / Điều phối"
        />
      </div>
    </section>
  );
}
