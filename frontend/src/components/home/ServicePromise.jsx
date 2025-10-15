import React from "react";
import { BadgeCheck, Shield, Package, Headphones } from "lucide-react";

const PROMISES = [
  { Icon: BadgeCheck, title:"Giá minh bạch", desc:"Hiển thị chi tiết phí trước khi xác nhận, không phí ẩn." },
  { Icon: Shield, title:"Tài xế xác thực", desc:"Đối tác lái xe có hồ sơ được kiểm chứng & đánh giá." },
  { Icon: Package, title:"Bảo hiểm hàng", desc:"Bảo hiểm cơ bản; có thể mua thêm gói mở rộng theo giá trị." },
  { Icon: Headphones, title:"Hỗ trợ 24/7", desc:"Theo dõi đơn & xử lý sự cố nhanh chóng mọi khung giờ." },
];

export default function ServicePromise() {
  return (
    <section className="relative py-12 lg:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[radial-gradient(1000px_600px_at_20%_10%,rgba(59,130,246,.10),transparent_55%),radial-gradient(900px_500px_at_90%_40%,rgba(167,139,250,.10),transparent_55%)]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100/60 bg-white/80 backdrop-blur p-6 md:p-8 shadow-[0_12px_40px_rgba(2,6,23,.08)]">
          <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold title-grad">Cam kết dịch vụ</h3>
              <p className="subtitle-soft mt-1">Giá minh bạch • Tài xế xác thực • Bảo hiểm hàng hóa • Hỗ trợ 24/7</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="#booking" className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-[0_10px_24px_rgba(37,99,235,.32)] btn-shine btn-blue">Đặt xe ngay</a>
              <a href="tel:19001234" className="px-4 py-2 rounded-xl border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 font-medium">Hotline 1900 1234</a>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROMISES.map(({Icon,title,desc})=>(
              <div key={title} className="p-5 rounded-xl bg-gradient-to-b from-white to-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Icon className="w-5 h-5" /> {title}
                </div>
                <p className="text-sm subtitle-soft mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
