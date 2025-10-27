import React from "react";

function statusStyles(status) {
  switch (status) {
    case "arriving":
      return "bg-[#E9F2FF] text-[#4A90E2] border-[#CFE0FF]";
    case "loading":
      return "bg-[#FFF8E8] text-[#B36A00] border-[#FFE3AF]";
    case "preparing":
      return "bg-[#EAFBF0] text-[#0E7B33] border-[#CBEFD8]";
    case "unloading":
      return "bg-[#F9E7FD] text-[#BD10E0] border-[#F0CCFA]";
    case "departed":
      return "bg-[#EEF2F7] text-[#334155] border-[#E2E8F0]";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

// 1 dòng timeline
function TimelineRow({ label, time, active }) {
  return (
    <li
      className={`grid grid-cols-[22px_max-content_1fr] items-center gap-3 my-2 text-[13px] leading-snug ${
        active ? "text-slate-900" : "text-slate-600"
      }`}
    >
      <span className="w-[22px] grid place-items-center">
        <span
          className={`rounded-full ${
            active
              ? "bg-[#2F6FE4] ring-[3px] ring-[#DCE7FF]"
              : "bg-[#BFD1F2] ring-2 ring-[#EDF2FF]"
          } w-[10px] h-[10px] block`}
        />
      </span>
      <span className="text-slate-700 whitespace-nowrap min-w-[80px] overflow-hidden text-ellipsis">
        {label}
      </span>
      <span className="text-slate-800 text-right whitespace-nowrap">{time}</span>
    </li>
  );
}

export default function VehicleCard({
  vehicle,
  selected,
  onSelect,
  maxTon = 15,
}) {
  const badgeCls = statusStyles(vehicle.status);

  const stages = [
    { label: "Preparing", time: vehicle.times[0], idx: 0 },
    { label: "Loading", time: vehicle.times[1], idx: 1 },
    { label: "Unloading", time: vehicle.times[2], idx: 2 },
    { label: "Arriving", time: vehicle.times[3], idx: 3 },
  ];

  return (
    <article
      onClick={onSelect}
      className={[
        "cursor-pointer bg-white rounded-[18px] border transition-all grid items-start",
        selected
          ? "border-2 border-[#2F6FE4] shadow-[0_10px_26px_rgba(47,111,228,.18)] p-4 grid-cols-[56px_1fr] gap-4"
          : "border-[#E6EAF2] hover:shadow-[0_8px_24px_rgba(20,30,55,.08)] hover:-translate-y-[1px] hover:border-[#D7E3FF] p-3 grid-cols-[56px_1fr] gap-3",
      ].join(" ")}
    >
      {/* Icon xe */}
      <div
        className="w-[56px] h-[56px] rounded-[14px] border border-[#E4EBFF] text-[#2F6FE4] text-[26px] grid place-items-center shadow-[0_1px_0_rgba(16,24,40,.03)]"
        style={{
          background:
            "linear-gradient(180deg,#F4F7FF 0%,#EEF3FF 100%)",
        }}
      >
        🚚
      </div>

      {/* Body */}
      <div className="min-w-0 flex flex-col">
        {/* Top row: mã + badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-slate-900 text-[14px] leading-none">
            {vehicle.id}
          </div>
          <span
            className={`text-[11px] border rounded-full px-3 py-[5px] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,.6)] whitespace-nowrap ${badgeCls}`}
          >
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </span>
        </div>

        {/* Nếu KHÔNG selected -> hiển thị hàng rút gọn */}
        {!selected && (
          <>
            <div className="text-[13px] text-slate-400 leading-snug">
              {vehicle.plate} · Tải trọng tối đa {maxTon} tấn
            </div>

            <div className="flex items-center gap-3 mt-2 ml-auto text-[13px]">
              <a
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#CFE0FF] bg-white text-[#2F6FE4] shadow-[0_1px_0_rgba(255,255,255,.6)] hover:bg-[#F1F7FF]"
                href="#"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span>Theo dõi</span>
              </a>

              <a
                className="text-[#2563eb] hover:underline"
                href="#"
                onClick={(e) => e.stopPropagation()}
              >
                Chi tiết
              </a>
            </div>
          </>
        )}

        {/* Nếu selected -> hiển thị đầy đủ */}
        {selected && (
          <>
            {/* route chip */}
            <div className="flex flex-wrap gap-2 text-[12px] text-[#263B66] mt-1 mb-2">
              <span className="inline-flex items-center rounded-full px-3 py-[6px] border border-[#E0E9FF] bg-[#F2F6FF] leading-none">
                {vehicle.route}
              </span>
            </div>

            {/* Timeline */}
            <ul className="mt-1">
              {stages.map((stage) => (
                <TimelineRow
                  key={stage.idx}
                  label={stage.label}
                  time={stage.time}
                  active={vehicle.active === stage.idx}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </article>
  );
}
