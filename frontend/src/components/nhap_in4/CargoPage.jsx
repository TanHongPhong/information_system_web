// components/CargoPage.jsx
import React, { useState } from "react";
import Stepper from "./Stepper";
import CargoForm from "./CargoForm";
import CostSummary from "./CostSummary";
import TipsCard from "./TipsCard";

export default function CargoPage() {
  const [calc, setCalc] = useState({
    wReal: 0, wVol: 0, wCharge: 0, base: 20000, perKg: 0, srv: 0,
  });

  return (
    <div className="max-w-7xl px-3 sm:px-4 lg:px-6 py-6 mx-auto">
      <Stepper />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Form */}
        <section className="lg:col-span-2">
          <CargoForm onCalc={setCalc} />
        </section>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <CostSummary
              wReal={calc.wReal}
              wVol={calc.wVol}
              wCharge={calc.wCharge}
              base={calc.base}
              perKg={calc.perKg}
              srv={calc.srv}
            />
            <TipsCard />
          </div>
        </aside>
      </div>
    </div>
  );
}
