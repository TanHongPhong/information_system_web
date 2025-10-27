// src/components/theo doi don hang/StatusPanel.jsx
import React from "react";
import { IconCalendar, IconClock } from "./IconsFeather";

export default function StatusPanel({ progress = 0.6 }) {
  // % tiến độ quãng đường (0 -> 1)
  const pct = progress * 100;

  // dữ liệu từng chặng giống UI bạn chụp
  const steps = [
    {
      title: "Departure",
      time: "17/7/2024, 10:00",
      addr: "279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM",
      state: "done",
      extra: null,
    },
    {
      title: "Stop",
      time: "17/7/2024, 12:00",
      addr: "76 Nguyễn Tất Thành, Quảng Ngãi",
      state: "current",
      extra: {
        processing: "Đang xử lý (15’)",
        ontime: true,
      },
    },
    {
      title: "Stop",
      time: "17/7/2024, 20:00",
      addr: "36 Phạm Văn Đồng, Thanh Hóa",
      state: "future",
      extra: null,
    },
    {
      title: "Arrival",
      time: "21/7/2024, 10:00",
      addr: "777 Lê Lợi, P.3, Q.1, TP.Hà Nội",
      state: "future",
      extra: null,
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col">
      {/* Header Status + Làm mới */}
      <div className="flex items-start justify-between">
        <h3 className="text-slate-900 font-semibold text-[15px] leading-none">
          Status
        </h3>

        <button className="rounded-xl border border-slate-300 bg-white text-[14px] text-slate-700 px-3 py-1.5 leading-none hover:bg-slate-50">
          Làm mới
        </button>
      </div>

      {/* Dòng địa điểm */}
      <div className="mt-3 flex flex-wrap text-[13px] text-slate-700 gap-x-4 gap-y-1">
        <span>TP.HCM</span>
        <span>Quảng Ngãi</span>
        <span>Thanh Hóa</span>
        <span>Hà Nội</span>
      </div>

      {/* Thanh tiến độ chuẩn theo screenshot */}
      <ProgressBar pct={pct} />

      {/* Danh sách các chặng */}
      <ul className="mt-4 flex flex-col gap-4">
        {steps.map((step, idx) => (
          <TimelineRow key={idx} step={step} />
        ))}
      </ul>
    </section>
  );
}

/* ======================
   PROGRESS BAR (đã chỉnh giống ảnh)
   ====================== */
function ProgressBar({ pct }) {
  // Tính toán vị trí các vạch
  const tick25Left = "25%";      // vạch trắng mảnh ở khoảng 1/4 thanh
  const endFillLeft = pct + "%"; // vạch xám đúng ranh giới phần xanh & phần nhạt

  // Badge “12 Hrs Left” trong hình nằm trên phần xanh, hơi lệch về trái,
  // không hẳn ở giữa thanh. Mình cố định khoảng 40% chiều ngang thanh.
  const badgeLeft = "40%";

  return (
    <div className="mt-2 relative">
      <div
        className={`
          relative w-full h-[34px] rounded-full overflow-hidden
          ring-1 ring-slate-300/70
          bg-gradient-to-r from-[#EAF1FF] to-[#F8FAFF]
        `}
      >
        {/* lớp xanh đậm bên trái (progress fill) */}
        <div
          className="absolute top-0 left-0 bottom-0 rounded-full"
          style={{
            width: pct + "%",
            background:
              "linear-gradient(90deg,#0048D8 0%,#1E5BFF 50%,#5F94FF 100%)",
          }}
        />

        {/* vạch trắng ở ~25% (cao ~22px, cách mép trên/dưới 6px) */}
        <span
          className="absolute w-px bg-white/90 rounded"
          style={{
            left: tick25Left,
            top: "6px",
            bottom: "6px",
          }}
        />

        {/* vạch xám mảnh đúng tại điểm kết thúc phần xanh */}
        <span
          className="absolute w-px bg-slate-300/70 rounded"
          style={{
            left: endFillLeft,
            top: "6px",
            bottom: "6px",
          }}
        />

        {/* Badge 12 Hrs Left */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2
            -translate-x-1/2
            px-3 py-[6px] rounded-full
            text-[13px] font-semibold leading-none text-[#0B43C6] whitespace-nowrap
            ring-1 ring-blue-300
            bg-gradient-to-b from-white to-[#EAF2FF]
            shadow-[0_10px_20px_rgba(30,102,255,.3)]
          `}
          style={{ left: badgeLeft }}
        >
          12 Hrs Left
        </div>
      </div>
    </div>
  );
}

/* ======================
   TIMELINE ROW (giữ nguyên logic, nhưng style giống screenshot)
   ====================== */
function TimelineRow({ step }) {
  const { title, time, addr, state, extra } = step;

  // Style chấm tròn bên trái
  // - done: chấm xanh dương đậm
  // - current: chấm xanh + vòng sáng (glow)
  // - future: vòng tròn rỗng xám
  let dotClass =
    "bg-transparent border-slate-400 border-2 w-[10px] h-[10px] rounded-full";
  if (state === "done") {
    dotClass =
      "bg-blue-600 border-blue-600 border-2 w-[10px] h-[10px] rounded-full";
  }
  if (state === "current") {
    dotClass =
      "bg-blue-600 border-blue-600 border-2 w-[10px] h-[10px] rounded-full ring-[4px] ring-blue-100";
  }

  // Card style theo trạng thái:
  // - done: nền trắng, viền xám nhạt
  // - current: nền xanh rất nhạt, viền xanh nhạt
  // - future: nền trắng, viền xám nhạt, text hơi xám
  let cardBorder = "border-slate-300";
  let cardBg = "bg-white";
  let titleColor = "text-slate-800";
  let bodyColor = "text-slate-600";

  if (state === "current") {
    cardBorder = "border-blue-300";
    cardBg = "bg-blue-50";
    titleColor = "text-slate-800";
    bodyColor = "text-slate-700";
  } else if (state === "future") {
    // giống screenshot: chữ hơi nhạt
    titleColor = "text-slate-700";
    bodyColor = "text-slate-600";
  }

  return (
    <li className="flex items-start gap-3">
      {/* chấm trạng thái */}
      <span className={dotClass} />

      {/* card nội dung */}
      <div
        className={
          "flex-1 rounded-xl border " +
          cardBorder +
          " " +
          cardBg +
          " shadow-sm px-4 py-3"
        }
      >
        {/* tiêu đề chặng + thời gian */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div
            className={
              "font-semibold leading-tight text-[15px] " + titleColor
            }
          >
            {title}
          </div>

          <div className="flex items-center gap-2 text-[13px] text-slate-600 leading-tight">
            <IconCalendar className="w-[16px] h-[16px]" />
            <span>{time}</span>
          </div>
        </div>

        {/* địa chỉ */}
        <div
          className={
            "mt-1 text-[13px] leading-snug break-words " + bodyColor
          }
        >
          {addr}
        </div>

        {/* badges cho trạng thái current */}
        {extra && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {extra.processing && (
              <span className="inline-flex items-center gap-1 text-[11px] leading-none text-blue-700 bg-white border border-blue-300 rounded-full px-2 py-1 shadow-sm">
                <IconClock className="w-[14px] h-[14px]" />
                {extra.processing}
              </span>
            )}

            {extra.ontime && (
              <span className="inline-flex items-center text-[11px] leading-none text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-1 font-semibold shadow-sm">
                ON TIME
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
