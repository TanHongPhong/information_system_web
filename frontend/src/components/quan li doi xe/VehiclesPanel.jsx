import React from "react";

// icon kính lúp nhỏ (cho nút "Theo dõi")
const IconSearchSmall = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function VehiclesPanel({ vehicles, selectedId, onSelectVehicle }) {
  return (
    <section className="flex flex-col gap-3 min-h-0 overflow-hidden">
      {/* header "Vehicles" + tabs */}
      <div className="sticky top-0 z-[1] bg-gradient-to-b from-white to-transparent pb-1">
        <h2
          className="text-[20px] text-[#1C2A44] mb-[10px]"
          style={{ fontWeight: 400 }}
        >
          Vehicles
        </h2>

        <div className="flex flex-wrap gap-2">
          {["Loading", "Unloading", "Arriving", "Preparing"].map((label, i) => (
            <button
              key={label}
              className={
                "px-[14px] py-[8px] text-[13px] rounded-[10px] border transition " +
                (i === 0
                  ? "bg-[#E9F2FF] border-[#CFE0FF] text-[#4A90E2]"
                  : "bg-white border-[#EAEBF0] text-[#52607A] hover:bg-[#E9F2FF] hover:border-[#CFE0FF] hover:text-[#4A90E2]")
              }
              style={{ fontWeight: 400 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* danh sách xe cuộn riêng */}
      <div
        className="flex flex-col gap-[14px] overflow-auto pr-2 min-h-0"
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {vehicles.map((v) => {
          const isSelected = v.id === selectedId;
          return (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isSelected={isSelected}
              onClick={() => onSelectVehicle(v.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

function VehicleCard({ vehicle, isSelected, onClick }) {
  const { id, plate, status, route, times, active } = vehicle;

  // chuẩn status-badge màu như HTML gốc
  const statusStyleMap = {
    arriving: {
      bg: "#E9F2FF",
      text: "#4A90E2",
      border: "#CFE0FF",
    },
    loading: {
      bg: "#FFF8E8",
      text: "#B36A00",
      border: "#FFE3AF",
    },
    preparing: {
      bg: "#EAFBF0",
      text: "#0E7B33",
      border: "#CBEFD8",
    },
    unloading: {
      bg: "#F9E7FD",
      text: "#BD10E0",
      border: "#F0CCFA",
    },
    departed: {
      bg: "#EEF2F7",
      text: "#334155",
      border: "#E2E8F0",
    },
  };

  const st = statusStyleMap[status] || {
    bg: "#EEF2F7",
    text: "#334155",
    border: "#E2E8F0",
  };

  const statusText =
    status?.charAt(0).toUpperCase() + status?.slice(1) || "—";

  // timeline data
  const tl = [
    { label: "Preparing", time: times?.[0], isOn: active === 0 },
    { label: "Loading", time: times?.[1], isOn: active === 1 },
    { label: "Unloading", time: times?.[2], isOn: active === 2 },
    { label: "Arriving", time: times?.[3], isOn: active === 3 },
  ];

  return (
    <article
      onClick={onClick}
      className={
        "relative bg-white border rounded-[18px] grid gap-[14px] transition-all ease-out " +
        (isSelected
          ? "border-[2px] border-[#2F6FE4] shadow-[0_10px_26px_rgba(47,111,228,.18)] p-4 pr-4"
          : "border-[#E6EAF2] shadow-[0_1px_0_rgba(0,0,0,.02)] hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] hover:-translate-y-px hover:border-[#D7E3FF] p-3 pr-4 items-center")
      }
      style={{
        gridTemplateColumns: "56px minmax(0,1fr)",
        cursor: "pointer",
      }}
    >
      {/* icon xe */}
      <div className="w-14 h-14 rounded-[14px] bg-[linear-gradient(180deg,#F4F7FF,#EEF3FF)] border border-[#E4EBFF] text-[#2F6FE4] text-[26px] grid place-items-center shadow-[0_1px_0_rgba(16,24,40,.03)] select-none">
        🚚
      </div>

      {/* body */}
      <div className="min-w-0 flex flex-col">
        {/* top line: ID + badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className="text-[#1C2A44]"
            style={{ fontWeight: 400, fontSize: "14px", lineHeight: 1.4 }}
          >
            {id}
          </div>

          <span
            className="rounded-full text-[11px] leading-none px-[12px] py-[5px] border shadow-[inset_0_1px_0_rgba(255,255,255,.6)] whitespace-nowrap"
            style={{
              backgroundColor: st.bg,
              color: st.text,
              borderColor: st.border,
              fontWeight: 400,
            }}
          >
            {statusText}
          </span>
        </div>

        {/* khi KHÔNG selected -> hiện sub + actions hàng ngang */}
        {!isSelected && (
          <>
            <div
              className="text-[13px] text-[#94A3B8] truncate"
              style={{ fontWeight: 400 }}
            >
              {plate} · Tải trọng tối đa 15 tấn
            </div>

            <div className="flex items-center gap-3 mt-2">
              <a
                className="flex items-center gap-2 rounded-full bg-white border border-[#CFE0FF] text-[#2F6FE4] text-[13px] px-3 py-[6px] shadow-[0_1px_0_rgba(255,255,255,.6)] hover:bg-[#F1F7FF]"
                href="#"
                onClick={(e) => e.stopPropagation()}
                style={{ fontWeight: 400 }}
              >
                <IconSearchSmall className="w-4 h-4" />
                <span>Theo dõi</span>
              </a>

              <a
                className="text-[13px] text-[#2563eb] hover:underline"
                href="#"
                onClick={(e) => e.stopPropagation()}
                style={{ fontWeight: 400 }}
              >
                Chi tiết
              </a>
            </div>
          </>
        )}

        {/* khi selected -> hiện route + timeline chi tiết */}
        {isSelected && (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className="text-[12px] text-[#263B66] bg-[#F2F6FF] border border-[#E0E9FF] rounded-full px-[10px] py-[6px]"
                style={{ fontWeight: 400 }}
              >
                {route}
              </span>
            </div>

            <ul className="mt-[6px] list-none">
              {tl.map((row, idx) => (
                <TimelineRow
                  key={idx}
                  label={row.label}
                  time={row.time}
                  active={row.isOn}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </article>
  );
}

function TimelineRow({ label, time, active }) {
  return (
    <li
      className="grid items-center my-2 gap-3"
      style={{
        gridTemplateColumns: "22px max-content 1fr",
        lineHeight: 1.5,
      }}
    >
      <span className="w-[22px] grid place-items-center">
        <span
          className="rounded-full"
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: active ? "#2F6FE4" : "#BFD1F2",
            boxShadow: active
              ? "0 0 0 3px #DCE7FF"
              : "0 0 0 2px #EDF2FF",
          }}
        />
      </span>

      <span
        className="text-[#475569] whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px] text-[13px]"
        style={{ fontWeight: 400 }}
      >
        {label}
      </span>

      <span
        className="text-[#1F2937] text-[13px] justify-self-end whitespace-nowrap"
        style={{ fontWeight: 400 }}
      >
        {time}
      </span>
    </li>
  );
}
