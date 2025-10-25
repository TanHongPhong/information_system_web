export default function FAQ() {
  const items = [
    ["Giá tính thế nào?", "Giá theo km + loại xe + dịch vụ thêm (bốc xếp, 2 chiều...). Hệ thống báo giá trước khi xác nhận."],
    ["Có hỗ trợ liên tỉnh?", "Có. Các tuyến phổ biến: HCM ↔ Đồng Nai/Bình Dương/BR-VT… và nhiều tỉnh thành khác."],
    ["Theo dõi đơn thế nào?", "Sau khi đặt, bạn nhận link theo dõi realtime: vị trí xe, ETA, trạng thái, lịch sử chuyển."],
    ["Có bốc xếp không?", "Có tuỳ chọn: tài xế hỗ trợ hoặc đội bốc xếp chuyên nghiệp theo giờ."],
    ["Thời gian chờ miễn phí?", "Miễn phí 15 phút đầu. Sau đó tính theo block 15 phút, hiển thị rõ trong chi tiết giá."],
    ["Phụ phí cấm giờ/cao tốc?", "Nếu tuyến đi qua cao tốc/cấm giờ, hệ thống tự cộng phụ phí (nếu có) vào báo giá trước khi đặt."],
    ["Hủy chuyến có mất phí?", "Huỷ trước khi tài xế bắt đầu di chuyển: miễn phí. Sau mốc này có thể phát sinh phí công di chuyển."],
    ["Có xuất hoá đơn & bảo hiểm hàng?", "Có xuất hoá đơn VAT theo yêu cầu. Hàng hóa được bảo hiểm cơ bản; bạn có thể mua thêm gói mở rộng."],
  ];

  return (
    <section id="faq" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Câu hỏi thường gặp</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {items.map(([q, a]) => (
            <details key={q} className="bg-white border border-slate-200 rounded-2xl p-5 open:shadow-[0_10px_24px_rgba(37,99,235,.32)] transition">
              <summary className="cursor-pointer font-semibold text-slate-800">{q}</summary>
              <p className="mt-2 text-sm subtitle-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
