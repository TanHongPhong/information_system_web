// components/Hero.jsx
import React from "react";

export default function Hero({
  title = "List of transportation vehicles",
  description = "Đây là danh sách các phương tiện sẵn sàng đáp ứng nhu cầu vận chuyển của bạn.",
  imageUrl = "https://png.pngtree.com/background/20220720/original/pngtree-road-photography-in-grassland-scenic-area-picture-image_1688712.jpg",
}) {
  return (
    <section className="relative h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden" id="hero">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.05) contrast(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_60%)]" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <h1
          className="text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight"
          style={{
            color: "#1E66FF",
            WebkitTextStroke: "1px rgba(255,255,255,.18)",
            textShadow: "0 3px 14px rgba(0,0,0,.85), 0 1px 0 rgba(0,0,0,.35)",
          }}
        >
          {title}
        </h1>
        <div className="mt-2 h-[6px] w-40 relative">
          <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/60 rounded-full" />
          <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[6px] w-24 bg-[#1E66FF] rounded-full shadow-[0_2px_10px_rgba(30,102,255,0.5)]" />
        </div>
        <p className="mt-3 max-w-4xl text-sm sm:text-base text-white/90 leading-relaxed">{description}</p>
      </div>
    </section>
  );
}
