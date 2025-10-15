import React from "react";
import { Cpu, Map, Shield, Headphones } from "lucide-react";

const ITEMS = [
  { Icon: Cpu, title:"Tự động & thông minh", desc:"Gợi ý xe theo cân nặng, tính km tối ưu, cảnh báo giờ cao điểm." },
  { Icon: Map, title:"Phủ rộng tuyến", desc:"Nội thành & liên tỉnh: HCM, Đồng Nai, Bình Dương, BR-VT…" },
  { Icon: Shield, title:"An toàn & minh bạch", desc:"Tài xế xác thực, hành trình ghi nhận, giá công khai." },
  { Icon: Headphones, title:"Hỗ trợ 24/7", desc:"Đội CSKH theo dõi đơn, xử lý sự cố nhanh chóng." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Vì sao chọn <span className="text-blue-700">6A Logistics</span>?</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ITEMS.map(({Icon,title,desc})=>(
            <div key={title} className="p-6 rounded-2xl bg-gradient-to-b from-white to-blue-50 border border-blue-100 hover:shadow-[0_10px_24px_rgba(37,99,235,.32)] transition">
              <Icon className="w-6 h-6 text-blue-600" />
              <div className="mt-3 font-semibold">{title}</div>
              <p className="mt-1 text-sm subtitle-soft">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
