import React from "react";

export default function LoadNote() {
  return (
    <div className="mt-2 flex items-start gap-2 bg-[#E9F2FF] text-[#0F2F63] border border-dashed border-blue-400/70 p-3 rounded-lg">
      <span className="w-5 h-5 grid place-items-center rounded-full border border-blue-300 bg-white text-blue-600 text-[12px] flex-none">i</span>
      <span className="text-sm">
        Kéo và thả các đơn hàng vào các khối trọng lượng có sẵn. Bạn cũng có thể di chuyển đơn hàng đến khối trọng lượng
        phù hợp. Các khối trọng lượng được đề xuất dựa trên đơn hàng bạn chọn và tính sẵn có.
      </span>
    </div>
  );
}
