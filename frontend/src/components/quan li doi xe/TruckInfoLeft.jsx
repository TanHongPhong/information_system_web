import React from "react";

/* ===== Feather-like inline icons (không cần lib ngoài) ===== */

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
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconBarChart = (props) => (
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
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.37 1.6.72 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.3a2 2 0 0 1 2.11-.45 11.36 11.36 0 0 0 2.34.72A2 2 0 0 1 22 16.92z" />
  </svg>
);

/* ===== Wrappers để icon có nền xanh nhạt và bóng đúng kiểu screenshot ===== */

function IconWrapperLarge({ children }) {
  return (
    <div
      className={`
        w-12 h-12 rounded-xl flex items-center justify-center
        bg-gradient-to-b from-[#eef4ff] to-[#e6f0ff]
        border border-[#d8e6ff]
        shadow-[0_8px_20px_rgba(37,99,235,.12),inset_0_1px_0_rgba(255,255,255,.75)]
        text-[#1e4ed8]
        shrink-0
      `}
    >
      {/* icon size ~22px */}
      <div className="w-[22px] h-[22px] text-inherit">{children}</div>
    </div>
  );
}

function IconWrapperSmall({ children }) {
  return (
    <div
      className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        bg-gradient-to-b from-[#eef4ff] to-[#e6f0ff]
        border border-[#d8e6ff]
        shadow-[0_6px_14px_rgba(37,99,235,.10),inset_0_1px_0_rgba(255,255,255,.75)]
        text-[#1e4ed8]
        shrink-0
      `}
    >
      {/* icon size ~16px */}
      <div className="w-[16px] h-[16px] text-inherit">{children}</div>
    </div>
  );
}

/* ===== Hàng lớn ở trên (Khối lượng tải / Tối đa / Còn trống / ETA) ===== */

function TopStatRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <IconWrapperLarge>{icon}</IconWrapperLarge>
      <div className="flex flex-col text-slate-700">
        <div className="text-[13px] text-slate-600">{label}</div>
        <div className="text-[20px] leading-snug text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ===== Card nhỏ 2 cột bên dưới (Biển số / Tài xế / Tuyến / Trạng thái / Mốc kế tiếp / Liên hệ nhanh) ===== */

function SmallInfoCard({ icon, label, value }) {
  return (
    <div
      className={`
        flex items-start gap-3
        rounded-md
        border border-[#d8e6ff]
        bg-[#eef4ff]
        p-4
        shadow-[0_8px_20px_rgba(37,99,235,.08)]
        text-slate-700
      `}
    >
      <IconWrapperSmall>{icon}</IconWrapperSmall>
      <div className="flex flex-col leading-snug">
        <div className="text-[13px] text-slate-600">{label}</div>
        <div className="text-[15px] text-slate-900 whitespace-pre-line">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENT CHÍNH CỘT TRÁI ===== */

export function TruckInfoLeft() {
  // dữ liệu giống screenshot bạn gửi
  const currentLoadTons = "2.5 tấn";
  const maxTons = "15 tấn";
  const emptyLeftTons = "7.5 tấn"; // screenshot hiển thị 7.5 tấn
  const etaText = "11/9/2025, 22:00";

  const plate = "DL04MP7045";
  const driver = "Trần Minh";
  const route = "Bình Định → Đà Nẵng";
  const status = "Arriving";
  const nextMilestone = "11/9/2025, 22:00";
  const quickContact = "Gọi tài xế / Điều phối";

  return (
    <div className="w-full max-w-[480px] text-slate-800 select-none">
      {/* 4 dòng lớn */}
      <div className="flex flex-col gap-6">
        <TopStatRow
          icon={<IconPackage />}
          label="Khối lượng tải"
          value={currentLoadTons}
        />
        <TopStatRow
          icon={<IconBarChart />}
          label="Trọng lượng tối đa"
          value={maxTons}
        />
        <TopStatRow
          icon={<IconInbox />}
          label="Còn trống"
          value={emptyLeftTons}
        />
        <TopStatRow icon={<IconClock />} label="ETA dự kiến" value={etaText} />
      </div>

      {/* Lưới 2 cột x 3 hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <SmallInfoCard
          icon={<IconHash />}
          label="Biển số"
          value={plate}
        />

        <SmallInfoCard
          icon={<IconUser />}
          label="Tài xế"
          value={driver}
        />

        <SmallInfoCard
          icon={<IconMapPin />}
          label="Tuyến"
          value={route}
        />

        <SmallInfoCard
          icon={<IconActivity />}
          label="Trạng thái"
          value={status}
        />

        <SmallInfoCard
          icon={<IconClock />}
          label="Mốc kế tiếp"
          value={nextMilestone}
        />

        <SmallInfoCard
          icon={<IconPhone />}
          label="Liên hệ nhanh"
          value={quickContact}
        />
      </div>
    </div>
  );
}
