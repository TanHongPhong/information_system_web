import { useEffect } from "react";
import feather from "feather-icons";

export default function Stepper({ steps }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [steps]);

  const badgeClass = (s) =>
    s === "done" || s === "active" ? "badge badge-active" : "badge badge-upcoming";
  const textClass = (s) =>
    s === "done" ? "done font-medium" : s === "active" ? "active font-semibold" : "upcoming";

  return (
    <ol className="stepper flex items-center w-full justify-center text-sm">
      {steps.map((s, i) => (
        <li key={i} className={textClass(s.status)}>
          <span className={badgeClass(s.status)}>{i + 1}</span>
          {s.label}
          {i < steps.length - 1 && <span className="mx-3 h-px w-10 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}
