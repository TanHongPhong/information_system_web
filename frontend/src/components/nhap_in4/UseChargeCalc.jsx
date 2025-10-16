import { useMemo } from "react";

export default function useChargeCalc({ weight, len, wid, hei }) {
  return useMemo(() => {
    const w = parseFloat(weight) || 0;
    const L = parseFloat(len) || 0;
    const W = parseFloat(wid) || 0;
    const H = parseFloat(hei) || 0;

    const wVol = L && W && H ? (L * W * H) / 6000 : 0;
    const wCharge = Math.max(w, wVol);

    const base = 20000;
    const perKg = 8000 * wCharge;
    const srv = 0;

    const total = Math.round(base + perKg + srv);

    return { wReal: w, wVol, wCharge, base, perKg, srv, total };
  }, [weight, len, wid, hei]);
}
