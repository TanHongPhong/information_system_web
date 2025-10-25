// components/Fields.jsx
import React from "react";

export function FieldWrap({ icon, unit, children, note }) {
  return (
    <div className={`relative ${note ? "" : ""}`}>
      {icon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}
      {children}
      {unit ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]">{unit}</span> : null}
    </div>
  );
}

const baseInput =
  "w-full h-10 rounded-xl border border-slate-200 bg-white outline-none transition px-3 pl-9 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
const baseText =
  "w-full min-h-[110px] rounded-xl border border-slate-200 bg-white outline-none transition px-3 pl-9 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

export const Lbl = ({ children, required }) => (
  <label className="text-[14px] font-semibold text-blue-700">
    {children}
    {required ? <span className="text-rose-500"> *</span> : null}
  </label>
);

export function Input({ icon, unit, ...props }) {
  return (
    <FieldWrap icon={icon} unit={unit}>
      <input {...props} className={baseInput} />
    </FieldWrap>
  );
}

export function Select({ icon, children, ...props }) {
  return (
    <FieldWrap icon={icon}>
      <select {...props} className={baseInput}>
        {children}
      </select>
    </FieldWrap>
  );
}

export function TextArea({ icon, ...props }) {
  return (
    <FieldWrap icon={icon} note>
      <textarea {...props} className={baseText} />
    </FieldWrap>
  );
}
