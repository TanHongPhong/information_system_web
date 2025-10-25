import React from "react";

export default function PackingTips() {
  const tips = [
    {
      icon: "📦",
      title: "Đóng gói đúng cách",
      description:
        "Sử dụng thùng carton chắc chắn, băng keo chất lượng, và đệm bọt khí để bảo vệ hàng hóa.",
    },
    {
      icon: "⚖️",
      title: "Kiểm tra kích thước & trọng lượng",
      description:
        "Đo đạc và cân chính xác để tránh phát sinh chi phí bổ sung.",
    },
    {
      icon: "🏷️",
      title: "Dán nhãn rõ ràng",
      description:
        "Ghi đầy đủ thông tin người gửi, người nhận, và cảnh báo hàng dễ vỡ nếu cần.",
    },
    {
      icon: "⚠️",
      title: "Lưu ý hàng đặc biệt",
      description:
        "Hàng dễ vỡ, chất lỏng, pin/ắc quy cần đóng gói theo quy định riêng.",
    },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-blue-900">
        Hướng dẫn đóng gói hàng hóa
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip) => (
          <div key={tip.title} className="flex gap-3">
            <div className="text-2xl">{tip.icon}</div>
            <div>
              <div className="font-medium text-blue-900">{tip.title}</div>
              <div className="text-sm text-blue-700">{tip.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
