import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

// Import từng component (đổi đường dẫn cho khớp dự án của bạn)
import HomeLocalStyles from "../components/home/HomeLocalStyles";
import GlobalBackground from "../components/home/GlobalBackground";
import NoticeBar from "../components/home/NoticeBar";
import HeroBooking from "../components/home/HeroBooking";
import FleetSection from "../components/home/FleetSection";
import FeaturesSection from "../components/home/FeaturesSection";
import RoutesSection from "../components/home/RoutesSection";
import PricingSection from "../components/home/PricingSection";
import TimelineSection from "../components/home/TimelineSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import ServicePromise from "../components/home/ServicePromise";
import MobileStickyCTA from "../components/home/MobileStickyCTA";

export default function HomePage() {
  return (
    <div className="text-slate-800 font-sans">
      {/* Local CSS + nền global */}
      <HomeLocalStyles />
      <GlobalBackground />

      {/* Các section đặc trưng (không gồm sidebar/header/topbar) */}
      <NoticeBar />
      <HeroBooking />
      <FleetSection />
      <FeaturesSection />
      <RoutesSection />
      <PricingSection />
      <TimelineSection />
      <TestimonialsSection />
      <ServicePromise />

      {/* CTA dính dưới mobile */}
      <MobileStickyCTA />
    </div>
  );
}
