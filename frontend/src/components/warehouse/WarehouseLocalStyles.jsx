import React from "react";

export default function WarehouseLocalStyles() {
  return (
    <style>{`
      html, body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      :is(button, a, select, input, details, summary):focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
      .thin-scrollbar::-webkit-scrollbar{height:8px;width:8px}
      .thin-scrollbar::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:9999px}
      .thin-scrollbar::-webkit-scrollbar-track{background:transparent}
      .shadow-soft{ box-shadow: 0 8px 30px rgba(15,23,42,.08); }
    `}</style>
  );
}
