import React from "react";

export default function LoadManagement({ loadPercent, maxTon }) {
  const usedTons = (maxTon * loadPercent) / 100;

  return (
    <section className="mb-4">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2 mt-2 mb-1">
        <h3
          className="text-[18px] text-[#0f172a]"
          style={{ fontWeight: 400, margin: 0 }}
        >
          Load Management
        </h3>
        <button
          className="w-5 h-5 grid place-items-center rounded-full border border-[#CBD5E1] bg-white text-[#64748B] text-[12px] leading-none cursor-help"
          title="Quản lý tải trọng theo phần trăm"
          style={{ fontWeight: 400 }}
        >
          i
        </button>
      </div>

      {/* thanh % */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-2">
        <div className="min-w-0">
          {/* nhãn % phía trên thanh */}
          <div
            className="relative text-[12px] text-[#94A3B8] h-[18px] mb-[6px] pointer-events-none"
            style={{ fontWeight: 400 }}
          >
            <span className="absolute left-0 top-0">0%</span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "25%" }}
            >
              25%
            </span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "50%" }}
            >
              50%
            </span>
            <span
              className="absolute top-0 -translate-x-1/2"
              style={{ left: "75%" }}
            >
              75%
            </span>
            <span
              className="absolute top-0 -translate-x-full"
              style={{ left: "100%" }}
            >
              100%
            </span>
          </div>

          {/* thanh chính */}
          <div className="relative h-[40px] rounded-[10px] bg-[#EEF2F7] shadow-[inset_0_1px_0_rgba(255,255,255,.6)] overflow-hidden">
            {/* phần fill xanh */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[linear-gradient(90deg,#0B5BDA,#63A3FF)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.3)]"
              style={{ width: `${loadPercent}%` }}
            />

            {/* các vạch đứt 25/50/75 */}
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "25%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "50%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              className="absolute top-2 bottom-2 w-[2px] opacity-45 pointer-events-none"
              style={{
                left: "75%",
                transform: "translateX(-1px)",
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px)",
              }}
            />
          </div>
        </div>

        {/* text tổng tải bên phải thanh */}
        <div
          className="text-[16px] whitespace-nowrap text-[#374151]"
          style={{ fontWeight: 400 }}
        >
          <span
            className="text-[#111827] mr-1"
            style={{ fontWeight: 700 }}
          >
            {usedTons.toFixed(1)} tấn
          </span>
          <span className="text-[#6B7280]">
            Trong số {maxTon} tấn tải trọng tối đa
          </span>
        </div>
      </div>

      {/* khung ghi chú */}
      <div className="mt-2 flex items-start gap-2 bg-[#E9F2FF] text-[#0F2F63] border border-dashed border-[#4A90E2] rounded-[8px] p-3 text-[13px] leading-[1.4]">
        <span className="flex-none w-5 h-5 grid place-items-center rounded-full border border-[#99C1FF] bg-white text-[#1E64D0] text-[12px] font-semibold leading-none">
          i
        </span>
        <span style={{ fontWeight: 400 }}>
          Kéo và thả các đơn hàng vào các khối trọng lượng có sẵn. Bạn cũng có
          thể di chuyển đơn hàng đến khối trọng lượng phù hợp. Các khối trọng
          lượng được đề xuất dựa trên đơn hàng bạn chọn và tính sẵn có.
        </span>
      </div>
    </section>
  );
}
