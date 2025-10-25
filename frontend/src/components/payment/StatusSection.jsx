import React from "react";

export default function StatusSection({ status, message }) {
  const statusClasses = {
    pending: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      title: "Đang chờ thanh toán",
      icon: "⌛",
    },
    processing: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      title: "Đang xử lý",
      icon: "🔄",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      title: "Thanh toán thành công",
      icon: "✅",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      title: "Có lỗi xảy ra",
      icon: "❌",
    },
  };

  const current = statusClasses[status] || statusClasses.pending;

  return (
    <div className={`${current.bg} border ${current.border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 font-semibold ${current.text}">
        <span>{current.icon}</span>
        <span>{current.title}</span>
      </div>
      {message && (
        <div className={`mt-1 text-sm ${current.text}`}>{message}</div>
      )}
    </div>
  );
}
