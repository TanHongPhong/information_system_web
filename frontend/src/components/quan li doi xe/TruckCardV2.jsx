import React from "react";

export function TruckCardV2({ loadPercent = 50 }) {
  // Đặt ảnh xe trắng nền studio giống screenshot của bạn trong public/truck.png
  // Nếu bạn dùng tên khác thì chỉnh lại đường dẫn dưới đây
  const truckImg = "/truck.png";

  return (
    <div
      className={`
        w-full
        rounded-[4px]
        border border-[#efefef]
        bg-white
        shadow-[0_20px_40px_rgba(20,30,55,.06)]
        p-6
        flex items-center justify-center
        min-h-[320px]
      `}
    >
      <div
        className="relative w-full max-w-[760px]"
        style={{
          // Giữ đúng tỷ lệ xe trong khung, không méo
          // max-w 760px giống bố cục screenshot
        }}
      >
        {/* ẢNH XE */}
        <img
          src={truckImg}
          alt="Truck"
          className="w-full h-auto block select-none"
          draggable={false}
        />

        {/* Ô hiển thị phần trăm tải trong thùng xe */}
        <div
          className="absolute"
          style={{
            // Các giá trị này canh theo mắt để đặt ô cam đúng vị trí thùng xe
            // Nếu lệch chút với ảnh thực tế của bạn, chỉnh 4 con số này
            left: "18%",
            top: "28%",
            width: "44%",
            height: "32%",
          }}
        >
          {/* Khung progress nền xám nhạt, bo góc nhẹ */}
          <div
            className="relative w-full h-full"
            style={{
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              boxShadow:
                "0 1px 2px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04) inset",
            }}
          >
            {/* Phần cam (50%) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#F5A623]"
              style={{
                width: `${loadPercent}%`,
                borderRadius: "4px 0 0 4px",
              }}
            />

            {/* Text 50% màu trắng, có viền tối nhẹ để nổi bật như trong hình */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-white text-[20px] leading-none font-medium"
                style={{
                  textShadow:
                    "0 1px 2px rgba(0,0,0,.6), 0 0 2px rgba(0,0,0,.4)",
                }}
              >
                {loadPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
