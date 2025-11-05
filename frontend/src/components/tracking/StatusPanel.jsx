// src/components/theo doi don hang/StatusPanel.jsx
import React, { useMemo, useCallback } from "react";
import { IconCalendar, IconClock } from "./IconsFeather";

export default function StatusPanel({ order, mapHeight }) {
  // Tính progress và steps dựa trên order status
  const { progress, steps, locations } = useMemo(() => {
    if (!order) {
      return {
        progress: 0,
        steps: [],
        locations: [],
      };
    }

    const status = order.status || "PENDING_PAYMENT";
    
    // Kiểm tra role để xác định có hiển thị các bước thanh toán không
    const role = localStorage.getItem("role");
    const isCustomer = role === "user";
    
    // Định nghĩa các bước theo status từ database
    // Nếu là customer, bao gồm cả PENDING_PAYMENT và PAID
    const allSteps = isCustomer ? [
      {
        key: "PENDING_PAYMENT",
        title: "Chờ thanh toán",
        status: "PENDING_PAYMENT",
        state: "future",
      },
      {
        key: "PAID",
        title: "Đã thanh toán",
        status: "PAID",
        state: "future",
      },
      {
        key: "ACCEPTED",
        title: "Đã tiếp nhận",
        status: "ACCEPTED",
        state: "future",
      },
      {
        key: "LOADING",
        title: "Đang bốc hàng",
        status: "LOADING",
        state: "future",
      },
      {
        key: "IN_TRANSIT",
        title: "Đang vận chuyển",
        status: "IN_TRANSIT",
        state: "future",
      },
      {
        key: "WAREHOUSE_RECEIVED",
        title: "Đã nhập kho",
        status: "WAREHOUSE_RECEIVED",
        state: "future",
      },
      {
        key: "COMPLETED",
        title: "Hoàn thành",
        status: "COMPLETED",
        state: "future",
      },
    ] : [
      {
        key: "ACCEPTED",
        title: "Accepted",
        status: "ACCEPTED",
        state: "done",
      },
      {
        key: "LOADING",
        title: "Loading",
        status: "LOADING",
        state: "future",
      },
      {
        key: "IN_TRANSIT",
        title: "In Transit",
        status: "IN_TRANSIT",
        state: "future",
      },
      {
        key: "WAREHOUSE_RECEIVED",
        title: "Warehouse Received",
        status: "WAREHOUSE_RECEIVED",
        state: "future",
      },
      {
        key: "COMPLETED",
        title: "Completed",
        status: "COMPLETED",
        state: "future",
      },
    ];

    // Xác định state của từng step dựa trên status hiện tại
    const statusOrder = isCustomer 
      ? ["PENDING_PAYMENT", "PAID", "ACCEPTED", "LOADING", "IN_TRANSIT", "WAREHOUSE_RECEIVED", "COMPLETED"]
      : ["ACCEPTED", "LOADING", "IN_TRANSIT", "WAREHOUSE_RECEIVED", "COMPLETED"];
    const currentStatusIndex = statusOrder.indexOf(status);
    
    const processedSteps = allSteps.map((step, index) => {
      let state = "future";
      if (index < currentStatusIndex) {
        state = "done";
      } else if (index === currentStatusIndex) {
        state = "current";
      }
      
      return {
        ...step,
        state,
      };
    });

    // Tính progress (0-100%)
    // Nếu status không tìm thấy trong statusOrder, mặc định là 0
    const progressPercent = currentStatusIndex >= 0 
      ? ((currentStatusIndex + 1) / allSteps.length) * 100 
      : 0;

    // Tạo steps với địa chỉ và thời gian thực tế
    const formatDate = (dateString) => {
      if (!dateString) return "Chưa có";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Chưa có";
      }
    };

    const stepsWithData = processedSteps.map((step) => {
      let addr = "";
      let time = "";
      let extra = null;

      if (step.key === "PENDING_PAYMENT") {
        // Chờ thanh toán: hiển thị địa chỉ lấy hàng
        addr = order.pickup_address || "Chưa có địa chỉ";
        time = formatDate(order.created_at);
        if (step.state === "current") {
          extra = { processing: "Vui lòng thanh toán trong vòng 15 phút", ontime: false };
        }
      } else if (step.key === "PAID") {
        // Đã thanh toán: hiển thị địa chỉ lấy hàng
        addr = order.pickup_address || "Chưa có địa chỉ";
        time = formatDate(order.updated_at || order.created_at);
      } else if (step.key === "ACCEPTED") {
        // Điểm xuất phát: địa chỉ lấy hàng
        addr = order.pickup_address || "Chưa có địa chỉ";
        time = formatDate(order.updated_at || order.created_at);
      } else if (step.key === "LOADING") {
        // Bốc hàng: tại điểm lấy hàng
        addr = order.pickup_address || "Chưa có địa chỉ";
        time = order.pickup_time ? formatDate(order.pickup_time) : formatDate(order.updated_at || order.created_at);
        if (step.state === "current") {
          extra = { processing: "Đang xử lý (15')", ontime: true };
        }
      } else if (step.key === "IN_TRANSIT") {
        // Đang vận chuyển: hiển thị route hoặc địa chỉ trung gian
        if (order.pickup_address && order.dropoff_address) {
          const pickupCity = order.pickup_address.split(",").pop()?.trim() || "";
          const dropoffCity = order.dropoff_address.split(",").pop()?.trim() || "";
          addr = pickupCity && dropoffCity ? `${pickupCity} → ${dropoffCity}` : order.pickup_address || order.dropoff_address || "Đang vận chuyển";
        } else {
          addr = order.pickup_address || order.dropoff_address || "Đang vận chuyển";
        }
        time = order.updated_at ? formatDate(order.updated_at) : "Chưa có";
        if (step.state === "current") {
          extra = { processing: "Đang xử lý (15')", ontime: true };
        }
      } else if (step.key === "WAREHOUSE_RECEIVED") {
        // Nhập kho: địa chỉ kho hoặc điểm đến
        addr = order.dropoff_address || "Chưa có địa chỉ";
        time = order.updated_at ? formatDate(order.updated_at) : "Chưa có";
        if (step.state === "current") {
          extra = { processing: "Đang xử lý (15')", ontime: true };
        }
      } else if (step.key === "COMPLETED") {
        // Hoàn thành: địa chỉ giao hàng cuối cùng
        addr = order.dropoff_address || "Chưa có địa chỉ";
        time = order.updated_at ? formatDate(order.updated_at) : "Chưa có";
      }

      return {
        ...step,
        addr,
        time,
        extra,
      };
    });

    // Extract locations từ địa chỉ
    const extractLocation = (address) => {
      if (!address) return "";
      // Lấy phần cuối cùng (thường là thành phố/tỉnh)
      const parts = address.split(",");
      return parts[parts.length - 1]?.trim() || address;
    };

    const locations = [];
    if (order.pickup_address) {
      locations.push(extractLocation(order.pickup_address));
    }
    if (order.dropoff_address && order.pickup_address !== order.dropoff_address) {
      locations.push(extractLocation(order.dropoff_address));
    }

    return {
      progress: progressPercent,
      steps: stepsWithData,
      locations,
    };
  }, [order]);

  // Tính ETA còn lại (nếu có pickup_time)
  const timeLeft = useMemo(() => {
    if (!order || !order.pickup_time || order.status === "COMPLETED") {
      return null;
    }

    try {
      const pickupTime = new Date(order.pickup_time);
      const now = new Date();
      const diffMs = pickupTime.getTime() - now.getTime();
      
      if (diffMs <= 0) return null;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours} Giờ`;
      } else if (minutes > 0) {
        return `${minutes} Phút`;
      }
      return null;
    } catch {
      return null;
    }
  }, [order]);

  if (!order) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col">
        <h3 className="text-slate-900 font-semibold text-[15px] leading-none">
          Status
        </h3>
        <div className="mt-4 text-center text-slate-500 text-sm">
          Chọn đơn hàng để xem trạng thái
        </div>
      </section>
    );
  }

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

      {/* Dòng địa điểm - căn về 2 đầu */}
      {locations.length > 0 && (
        <div className="mt-3 flex justify-between items-center text-[13px] text-slate-700">
          {locations.length >= 2 ? (
            <>
              <span>{locations[0]}</span>
              <span>{locations[locations.length - 1]}</span>
            </>
          ) : (
            <span>{locations[0]}</span>
          )}
        </div>
      )}

      {/* Thanh tiến độ */}
      <ProgressBar pct={progress} timeLeft={timeLeft} />

      {/* Danh sách các chặng với đường line dọc */}
      <div className="mt-4 relative">
        {/* Đường line dọc nối các dots - chỉ hiển thị giữa các dots, không che phủ */}
        {steps.length > 1 && (
          <div 
            className="absolute w-0.5 bg-slate-200" 
            style={{ 
              left: "5px",
              top: "5px", // Bắt đầu từ giữa dot đầu tiên
              bottom: "5px", // Kết thúc ở giữa dot cuối cùng
              height: `calc(100% - 10px)` // Trừ đi khoảng cách top và bottom
            }} 
          />
        )}
        <ul className="relative flex flex-col gap-4">
          {steps.map((step, idx) => (
            <TimelineRow key={step.key || idx} step={step} isLast={idx === steps.length - 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ======================
   PROGRESS BAR (giữ nguyên style như cũ)
   ====================== */
function ProgressBar({ pct, timeLeft }) {
  // Tính toán vị trí các vạch
  const tick25Left = "25%";      // vạch trắng mảnh ở khoảng 1/4 thanh
  const endFillLeft = Math.min(pct, 100) + "%"; // vạch xám đúng ranh giới phần xanh & phần nhạt

  // Badge time left - hiển thị nếu có timeLeft, nếu không thì hiển thị mặc định "12 Hrs Left"
  const showBadge = pct > 0 && pct < 100;
  const badgeText = timeLeft ? `${timeLeft} Left` : "12 Hrs Left";
  // Căn về phía bên phải (sử dụng right thay vì left)
  const badgeRight = "8px"; // Khoảng cách từ bên phải

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
            width: Math.min(pct, 100) + "%",
            background:
              "linear-gradient(90deg,#0048D8 0%,#1E5BFF 50%,#5F94FF 100%)",
          }}
        />

        {/* vạch trắng ở ~25% */}
        <span
          className="absolute w-px bg-white/90 rounded"
          style={{
            left: tick25Left,
            top: "6px",
            bottom: "6px",
          }}
        />

        {/* vạch xám mảnh đúng tại điểm kết thúc phần xanh */}
        {pct > 0 && pct < 100 && (
          <span
            className="absolute w-px bg-slate-300/70 rounded"
            style={{
              left: endFillLeft,
              top: "6px",
              bottom: "6px",
            }}
          />
        )}

        {/* Badge time left - căn về phía bên phải */}
        {showBadge && (
          <div
            className={`
              absolute top-1/2 -translate-y-1/2
              px-3 py-[6px] rounded-full
              text-[13px] font-semibold leading-none text-[#0B43C6] whitespace-nowrap
              ring-1 ring-blue-300
              bg-gradient-to-b from-white to-[#EAF2FF]
              shadow-[0_10px_20px_rgba(30,102,255,.3)]
            `}
            style={{ right: badgeRight }}
          >
            {badgeText}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================
   TIMELINE ROW
   ====================== */
function TimelineRow({ step, isLast }) {
  const { title, time, addr, state, extra } = step;

  // Style chấm tròn bên trái (relative để nổi lên trên line)
  let dotClass =
    "relative z-10 bg-transparent border-slate-400 border-2 w-[10px] h-[10px] rounded-full shrink-0";
  if (state === "done") {
    dotClass =
      "relative z-10 bg-blue-600 border-blue-600 border-2 w-[10px] h-[10px] rounded-full shrink-0";
  }
  if (state === "current") {
    dotClass =
      "relative z-10 bg-blue-600 border-blue-600 border-2 w-[10px] h-[10px] rounded-full ring-[4px] ring-blue-100 shrink-0";
  }

  // Card style theo trạng thái
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
    titleColor = "text-slate-700";
    bodyColor = "text-slate-600";
  }

  return (
    <li className="flex items-start gap-3 relative">
      {/* chấm trạng thái - nổi lên trên line */}
      <span className={dotClass} style={{ marginTop: "2px" }} />

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
