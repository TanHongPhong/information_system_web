import React from "react";

export default function FilterBtn({ label, isActive, onClick }) {
  return (
    <button
      className={`h-10 px-4 rounded-xl ${
        isActive
          ? "bg-blue-600 text-white"
          : "border border-slate-200 hover:bg-slate-100"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
